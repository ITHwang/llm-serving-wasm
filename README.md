# LLM Serving using WebAssembly

[![License](https://img.shields.io/badge/license-Apache%202.0-blue?style=flat-square)](https://github.com/huggingface/candle/blob/main/LICENSE-APACHE)

## Overview

- [Candle](https://github.com/huggingface/candle) is a Rust-based Deep Learning framework that can leverage Rust's strong WebAssembly capabilities.
- Inspired by the below online demos, I've made up my mind to build the other demos with state-of-the-art LLMs.
  - [yolo](https://huggingface.co/spaces/lmz/candle-yolo): pose estimation and
    object recognition.
  - [whisper](https://huggingface.co/spaces/lmz/candle-whisper): speech recognition.
  - [LLaMA2](https://huggingface.co/spaces/lmz/candle-llama2): text generation.
  - [T5](https://huggingface.co/spaces/radames/Candle-T5-Generation-Wasm): text generation.
  - [Phi-1.5, and Phi-2](https://huggingface.co/spaces/radames/Candle-Phi-1.5-Wasm): text generation.
  - [Segment Anything Model](https://huggingface.co/spaces/radames/candle-segment-anything-wasm): Image segmentation.
  - [BLIP](https://huggingface.co/spaces/radames/Candle-BLIP-Image-Captioning): image captioning.

## Features

### CLI Serving
- [x] Qwen2-Instruct
- [x] Quantized Qwen2-Instruct(q4_0)
- [x] Qwen2.5-Instruct
- [x] Quantized Qwen2.5-Instruct(q4_0)

### WASM Serving
- [x] Qwen2.5-Instruct [demo](https://huggingface.co/spaces/ITHwangg/candle-qwen25-wasm-demo)
- [x] Quantized Qwen2.5-Instruct [demo](https://huggingface.co/spaces/ITHwangg/candle-qwen25-wasm-demo)

## License
- This repository was forked from the original `candle` repository which is licensed under the Apache License Version 2.0.
- According to the license, you can check the modifications of the original code in the `CHANGELOG.md` file.