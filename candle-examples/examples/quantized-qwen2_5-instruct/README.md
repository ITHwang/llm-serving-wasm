# candle-quantized-qwen2.5-instruct

[Qwen2.5]((https://qwenlm.github.io/blog/qwen2.5/)) is an upgraded version of Qwen2, released by Alibaba Cloud.

## Running the example

```bash
cargo run --example quantized-qwen2_5-instruct --release -- --prompt "Write a function to count prime numbers up to N."
```

0.5b, 1.5b, 7b, 14b and 32b models are available via `--model` argument.