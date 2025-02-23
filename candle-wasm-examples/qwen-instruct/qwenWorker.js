import init, { Model } from "./build/m.js";

async function fetchArrayBuffer(url, localURL) {
  const cacheName = "qwen-instruct-candle-cache";
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(url);
  if (cachedResponse) {
    console.log("load model from cache");
    const data = await cachedResponse.arrayBuffer();
    return new Uint8Array(data);
  }

  const localResponse = await fetch(localURL, { cache: "force-cache" });
  if (localResponse.ok) {
    console.log("load model from local");
    cache.put(url, localResponse.clone());
    return new Uint8Array(await localResponse.arrayBuffer());
  }

  console.log("load model from remote");
  const res = await fetch(url, { cache: "force-cache" });
  cache.put(url, res.clone());
  return new Uint8Array(await res.arrayBuffer());
}
async function concatenateArrayBuffers(urls) {
  const arrayBuffers = await Promise.all(urls.map(url => fetchArrayBuffer(url)));

  let totalLength = arrayBuffers.reduce((acc, arrayBuffer) => acc + arrayBuffer.byteLength, 0);
  let concatenatedBuffer = new Uint8Array(totalLength);

  let offset = 0;
  arrayBuffers.forEach(buffer => {
    concatenatedBuffer.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  });
  return concatenatedBuffer;
}

class Qwen {
  static instance = {};

  static async getInstance(
    weightsURL,
    modelID,
    tokenizerURL,
    configURL,
    quantized
  ) {
    // load individual modelID only once
    if (!this.instance[modelID]) {
      await init();

      const weight_filename = weightsURL.split("/").filter(Boolean).pop()
      const tokenizer_filename = tokenizerURL.split("/").filter(Boolean).pop()
      const config_filename = configURL.split("/").filter(Boolean).pop()

      const localWeightsURL = `./model/${modelID}/${weight_filename}`;
      const localTokenizerURL = `./model/${modelID}/${tokenizer_filename}`;
      const localConfigURL = `./model/${modelID}/${config_filename}`;

      self.postMessage({ status: "loading", message: "Loading Model" });
      const [weightsArrayU8, tokenizerArrayU8, configArrayU8] =
        await Promise.all([
          weightsURL instanceof Array ? concatenateArrayBuffers(weightsURL) : fetchArrayBuffer(weightsURL, localWeightsURL),
          fetchArrayBuffer(tokenizerURL, localTokenizerURL),
          fetchArrayBuffer(configURL, localConfigURL),
        ]);

      this.instance[modelID] = new Model(
        weightsArrayU8,
        tokenizerArrayU8,
        configArrayU8,
        quantized
      );
    }
    return this.instance[modelID];
  }
}

let controller = null;
self.addEventListener("message", (event) => {
  if (event.data.command === "start") {
    controller = new AbortController();
    generate(event.data);
  } else if (event.data.command === "abort") {
    controller.abort();
  }
});

async function generate(data) {
  const {
    weightsURL,
    modelID,
    tokenizerURL,
    configURL,
    quantized,
    prompt,
    temp,
    top_p,
    repeatPenalty,
    seed,
    maxSeqLen,
  } = data;
  try {
    self.postMessage({ status: "loading", message: "Starting Qwen" });
    const model = await Qwen.getInstance(
      weightsURL,
      modelID,
      tokenizerURL,
      configURL,
      quantized
    );

    self.postMessage({ status: "loading", message: "Initializing model" });
    const promptString = `<|im_start|>user\n${prompt}<|im_end|>\n<|im_start|>assistant\n`;
    const firstToken = model.init_with_prompt(
      promptString,
      temp,
      top_p,
      repeatPenalty,
      64,
      BigInt(seed)
    );
    const seq_len = 2048;

    let sentence = firstToken;
    let maxTokens = maxSeqLen ? maxSeqLen : seq_len - promptString.length - 1;
    let startTime = performance.now();
    let tokensCount = 0;
    while (tokensCount < maxTokens) {
      await new Promise(async (resolve) => {
        if (controller && controller.signal.aborted) {
          self.postMessage({
            status: "aborted",
            message: "Aborted",
            output: prompt + sentence,
          });
          return;
        }
        const token = await model.next_token();
        if (token === "<|im_end|>") {
          self.postMessage({
            status: "complete",
            message: "complete",
            output: prompt + sentence,
          });
          return;
        }
        const tokensSec =
          ((tokensCount + 1) / (performance.now() - startTime)) * 1000;

        sentence += token;
        self.postMessage({
          status: "generating",
          message: "Generating token",
          token: token,
          sentence: sentence,
          totalTime: performance.now() - startTime,
          tokensSec,
          prompt: prompt,
        });
        setTimeout(resolve, 0);
      });
      tokensCount++;
    }
    self.postMessage({
      status: "complete",
      message: "complete",
      output: prompt + sentence,
    });
  } catch (e) {
    self.postMessage({ error: e });
  }
}
