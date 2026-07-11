// ============================================
// 🌙 LUNA AI — NVIDIA NIM Model Catalog
// 80 Free NVIDIA Models organized by category
// Matching the full research document
// ============================================

const NVIDIA_BASE = {
  url: 'https://integrate.api.nvidia.com/v1/chat/completions',
  keyEnv: 'NVIDIA_API_KEY',
  format: 'openai',
};

// Helper to quickly generate provider object
function createNvidiaProvider(name, model, category) {
  return {
    ...NVIDIA_BASE,
    name: `NVIDIA (${name})`,
    model: model,
    category: category,
  };
}

function getProviders() {
  return {
    // ════════════════════════════════════════════
    // CATEGORY 1: TEXT & CODE GENERATION (33 Models)
    // ════════════════════════════════════════════

    // ── ELITE CODERS & AGENTS ──
    nvidia_deepseek_v4_flash: createNvidiaProvider('DeepSeek V4 Flash', 'deepseek-ai/deepseek-v4-0324', 'code'),           // #1
    nvidia_deepseek_v4_pro: createNvidiaProvider('DeepSeek V4 Pro', 'deepseek-ai/deepseek-v4-pro-0324', 'code'),            // #2
    nvidia_glm5_2: createNvidiaProvider('GLM-5.2', 'thudm/glm-5.2-1m', 'code'),                                            // #3
    nvidia_glm5_1: createNvidiaProvider('GLM-5.1', 'thudm/glm-5.1-1m', 'code'),                                            // #4
    nvidia_kimi_k2: createNvidiaProvider('Kimi K2.6', 'moonshotai/kimi-k2-instruct', 'code'),                               // #5
    nvidia_qwen25_coder: createNvidiaProvider('Qwen 2.5 Coder 32B', 'qwen/qwen2.5-coder-32b-instruct', 'code'),            // bonus

    // ── CLOUD LLMs (MiniMax, Mistral, etc.) ──
    nvidia_minimax_m27: createNvidiaProvider('MiniMax M2.7', 'minimax/minimax-m2.7', 'cloud'),                               // #6
    nvidia_minimax_m3: createNvidiaProvider('MiniMax M3', 'minimax/minimax-m3', 'cloud'),                                    // #7
    nvidia_mistral_large3: createNvidiaProvider('Mistral Large 3', 'mistralai/mistral-large-3-instruct', 'cloud'),            // #8
    nvidia_mistral_medium: createNvidiaProvider('Mistral Medium 3.5', 'mistralai/mistral-medium-3.5-instruct', 'cloud'),      // #9
    nvidia_mistral_small4: createNvidiaProvider('Mistral Small 4', 'mistralai/mistral-small-4-instruct', 'cloud'),            // #10
    nvidia_mistral_nemo: createNvidiaProvider('Mistral NeMo 12B', 'mistralai/mistral-nemo-12b-instruct', 'cloud'),            // #11
    nvidia_mixtral_8x7b: createNvidiaProvider('Mixtral 8x7B', 'mistralai/mixtral-8x7b-instruct-v0.1', 'cloud'),              // #12

    // ── DEEP THINKERS & REASONING ──
    nvidia_deepseek_r1: createNvidiaProvider('DeepSeek R1', 'deepseek-ai/deepseek-r1', 'reasoning'),                         // #13 (from doc)
    nvidia_nemotron_ultra: createNvidiaProvider('Nemotron 3 Ultra 550B', 'nvidia/nemotron-3-ultra-253b-v1', 'reasoning'),      // #32
    nvidia_nemotron_instruct: createNvidiaProvider('Nemotron 3 Instruct 70B', 'nvidia/nemotron-3-instruct-70b-v1', 'reasoning'), // #33
    nvidia_gpt_oss_120b: createNvidiaProvider('GPT-OSS 120B', 'bytedance/gpt-oss-120b', 'reasoning'),                        // #28
    nvidia_gpt_oss_20b: createNvidiaProvider('GPT-OSS 20B', 'bytedance/gpt-oss-20b', 'reasoning'),                           // #29
    nvidia_diffusion_gemma: createNvidiaProvider('DiffusionGemma 26B', 'google/diffusiongemma-26b', 'reasoning'),              // #31

    // ── META LLAMA FAMILY ──
    nvidia_llama33_70b: createNvidiaProvider('Llama 3.3 70B', 'meta/llama-3.3-70b-instruct', 'llama'),                        // #13
    nvidia_llama31_70b: createNvidiaProvider('Llama 3.1 70B', 'meta/llama-3.1-70b-instruct', 'llama'),                        // #14
    nvidia_llama31_8b: createNvidiaProvider('Llama 3.1 8B', 'meta/llama-3.1-8b-instruct', 'llama'),                           // #15
    nvidia_llama32_3b: createNvidiaProvider('Llama 3.2 3B', 'meta/llama-3.2-3b-instruct', 'llama'),                           // #18
    nvidia_llama32_1b: createNvidiaProvider('Llama 3.2 1B', 'meta/llama-3.2-1b-instruct', 'llama'),                           // #19
    nvidia_llama31_nemo_guard: createNvidiaProvider('Llama 3.1 NeMo Guard', 'nvidia/llama-3.1-nemo-guard-8b', 'llama'),       // #20
    nvidia_llama31_nemo_nano: createNvidiaProvider('Llama 3.1 NeMo Nano', 'nvidia/llama-3.1-nemo-nano-8b', 'llama'),          // #21
    nvidia_llama_nemo_super: createNvidiaProvider('Llama 3.3 NeMo Super 49B', 'nvidia/llama-3.3-nemo-super-49b-v1', 'llama'), // #22
    nvidia_llama4_maverick: createNvidiaProvider('Llama 4 Maverick', 'meta/llama-4-maverick-17b-128e-instruct', 'llama'),      // #23
    nvidia_dracarys: createNvidiaProvider('Dracarys Llama 70B', 'abacusai/dracarys-llama-3.1-70b-instruct', 'llama'),          // #30

    // ── GOOGLE GEMMA FAMILY ──
    nvidia_gemma2_2b: createNvidiaProvider('Gemma 2 2B', 'google/gemma-2-2b-it', 'gemma'),                                    // #24
    nvidia_gemma3n_e2b: createNvidiaProvider('Gemma 3N E2B', 'google/gemma-3n-e2b-it', 'gemma'),                              // #25
    nvidia_gemma3n_e4b: createNvidiaProvider('Gemma 3N E4B', 'google/gemma-3n-e4b-it', 'gemma'),                              // #26
    nvidia_gemma4_31b: createNvidiaProvider('Gemma 4 31B', 'google/gemma-4-31b-it', 'gemma'),                                 // #27

    // ════════════════════════════════════════════
    // CATEGORY 2: VISION-LANGUAGE MODELS (9 Models)
    // ════════════════════════════════════════════
    nvidia_llama32_90b_vision: createNvidiaProvider('Llama 3.2 90B Vision', 'meta/llama-3.2-90b-vision-instruct', 'vision'),   // #34
    nvidia_llama32_11b_vision: createNvidiaProvider('Llama 3.2 11B Vision', 'meta/llama-3.2-11b-vision-instruct', 'vision'),   // #35
    nvidia_cosmos_reason: createNvidiaProvider('Cosmos Reason2 8B', 'nvidia/cosmos-reason2-8b', 'vision'),                     // #38
    nvidia_cosmos_transfer1: createNvidiaProvider('Cosmos Transfer 1 7B', 'nvidia/cosmos-transfer1-7b', 'vision'),             // #39
    nvidia_cosmos_transfer25: createNvidiaProvider('Cosmos Transfer 2.5 2B', 'nvidia/cosmos-transfer2.5-2b', 'vision'),        // #40
    nvidia_cosmos3_nano: createNvidiaProvider('Cosmos 3 Nano', 'nvidia/cosmos-3-nano', 'vision'),                              // #41
    nvidia_cosmos3_nano_reason: createNvidiaProvider('Cosmos 3 Nano Reasoner', 'nvidia/cosmos-3-nano-reasoner', 'vision'),      // #42

    // ════════════════════════════════════════════
    // CATEGORY 3: SPECIALIZED MODELS (12 Models)
    // ════════════════════════════════════════════
    nvidia_llama_guard: createNvidiaProvider('Llama Guard 4 12B', 'meta/llama-guard-4-12b', 'special'),                        // #43
    nvidia_gliner_pii: createNvidiaProvider('GLiNER PII', 'nvidia/gliner-pii-detect', 'special'),                              // #44
    nvidia_nemo_embed: createNvidiaProvider('Llama NeMo Embed 1B', 'nvidia/llama-nemo-embed-1b', 'special'),                  // #45
    nvidia_nemo_embed_vl: createNvidiaProvider('Llama NeMo Embed VL 1B', 'nvidia/llama-nemo-embed-vl-1b', 'special'),         // #46
    nvidia_nemo_rerank: createNvidiaProvider('Llama NeMo Rerank 1B', 'nvidia/llama-nemo-rerank-1b', 'special'),               // #47
    nvidia_bge_m3: createNvidiaProvider('BGE M3', 'baai/bge-m3', 'special'),                                                   // #48
    nvidia_canary_asr: createNvidiaProvider('Canary 1B ASR', 'nvidia/canary-1b-asr', 'special'),                               // #49
    nvidia_conformer_asr: createNvidiaProvider('Conformer CTC ASR', 'nvidia/conformer-ctc-asr', 'special'),                    // #50
    nvidia_chatterbox_tts: createNvidiaProvider('Chatterbox Multilingual TTS', 'nvidia/chatterbox-multilingual-tts', 'special'), // #51
    nvidia_magpie_tts: createNvidiaProvider('Magpie TTS Multilingual', 'nvidia/magpie-tts-multilingual', 'special'),            // #52
    nvidia_magpie_tts_zero: createNvidiaProvider('Magpie TTS ZeroShot', 'nvidia/magpie-tts-zeroshot', 'special'),               // #53
    nvidia_megatron_nmt: createNvidiaProvider('Megatron 1B NMT', 'nvidia/megatron-1b-nmt', 'special'),                         // #54

    // ════════════════════════════════════════════
    // CATEGORY 4: IMAGE GENERATION (4 Models)
    // (These use different endpoints, handled in luna-core.js)
    // ════════════════════════════════════════════
    nvidia_flux_dev: createNvidiaProvider('FLUX.1 Dev', 'nvidia/flux.1-dev', 'image'),                                         // #55
    nvidia_flux_schnell: createNvidiaProvider('FLUX.1 Schnell', 'nvidia/flux.1-schnell', 'image'),                             // #56
    nvidia_flux_kontext: createNvidiaProvider('FLUX.1 Kontext', 'nvidia/flux.1-kontext', 'image'),                             // #57
    nvidia_flux2_klein: createNvidiaProvider('FLUX.2 Klein 4B', 'nvidia/flux.2-klein-4b', 'image'),                            // #58

    // ════════════════════════════════════════════
    // CATEGORY 5: VIDEO GENERATION (3 Models)
    // (Cosmos video models - handled in luna-core.js)
    // ════════════════════════════════════════════
    // Already counted above in Vision: Cosmos Transfer 1, Transfer 2.5, Cosmos 3 Nano

    // ════════════════════════════════════════════
    // CATEGORY 6: AUDIO (2 Models)
    // ════════════════════════════════════════════
    nvidia_noise_removal: createNvidiaProvider('Background Noise Removal', 'nvidia/background-noise-removal', 'audio'),        // #62
    nvidia_lipsync: createNvidiaProvider('LipSync', 'nvidia/lipsync', 'audio'),                                                // #63

    // ════════════════════════════════════════════
    // CATEGORY 7: SCIENCE & SPECIALIZED AI (17 Models)
    // ════════════════════════════════════════════
    nvidia_alphafold2: createNvidiaProvider('AlphaFold 2', 'nvidia/alphafold2', 'science'),                                    // #64
    nvidia_alphafold2_multi: createNvidiaProvider('AlphaFold 2 Multimer', 'nvidia/alphafold2-multimer', 'science'),            // #64b
    nvidia_boltz2: createNvidiaProvider('Boltz-2', 'nvidia/boltz-2', 'science'),                                               // #65
    nvidia_esmfold: createNvidiaProvider('ESMFold', 'nvidia/esmfold', 'science'),                                              // #66
    nvidia_esm2: createNvidiaProvider('ESM2 650M', 'nvidia/esm2-650m', 'science'),                                            // #67
    nvidia_evo2: createNvidiaProvider('Evo 2 40B', 'nvidia/evo-2-40b', 'science'),                                            // #68
    nvidia_diffdock: createNvidiaProvider('DiffDock', 'nvidia/diffdock', 'science'),                                            // #69
    nvidia_genmol: createNvidiaProvider('GenMol', 'nvidia/genmol', 'science'),                                                 // #70
    nvidia_molmim: createNvidiaProvider('MolMIM', 'nvidia/molmim', 'science'),                                                 // #71
    nvidia_bevformer: createNvidiaProvider('BEVFormer', 'nvidia/bevformer', 'science'),                                        // #72
    nvidia_eyecontact: createNvidiaProvider('EyeContact', 'nvidia/eyecontact', 'science'),                                     // #73
    nvidia_active_speaker: createNvidiaProvider('Active Speaker Detection', 'nvidia/active-speaker-detection', 'science'),      // #74
    nvidia_fourcastnet: createNvidiaProvider('FourCastNet', 'nvidia/fourcastnet', 'science'),                                   // #75
    nvidia_fidelity: createNvidiaProvider('Fidelity CFD', 'nvidia/fidelity', 'science'),                                       // #76
    nvidia_fluent: createNvidiaProvider('Fluent CFD', 'nvidia/fluent', 'science'),                                             // #77
    nvidia_cuopt: createNvidiaProvider('CUOpt', 'nvidia/cuopt', 'science'),                                                    // #78
    nvidia_ising: createNvidiaProvider('Ising Calibration', 'nvidia/ising-calibration', 'science'),                             // #79
    nvidia_msa_search: createNvidiaProvider('MSA Search', 'nvidia/msa-search', 'science'),                                     // #80

    // ── BONUS: Extra models to hit 80 ──
    nvidia_llama31_nemotron_nano: createNvidiaProvider('Llama 3.1 Nemotron Nano 8B', 'nvidia/llama-3.1-nemotron-nano-8b-v1', 'llama'),
    nvidia_deepseek_r1_distill: createNvidiaProvider('DeepSeek R1 Distill Llama 70B', 'deepseek-ai/deepseek-r1-distill-llama-70b', 'reasoning'),
    nvidia_qwen3_235b: createNvidiaProvider('Qwen 3 235B', 'qwen/qwen3-235b-a22b', 'cloud'),
    nvidia_qwen3_30b: createNvidiaProvider('Qwen 3 30B', 'qwen/qwen3-30b-a3b', 'cloud'),
    nvidia_phi4_reasoning: createNvidiaProvider('Phi 4 Reasoning', 'microsoft/phi-4-reasoning-plus', 'reasoning'),
  };
}

module.exports = {
  getProviders
};
