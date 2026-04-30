// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT
//
// Minimal WebGPU type declarations for compile-time safety.
// These types mirror the WebGPU spec subset used by the compute abstraction.
// At runtime, the actual browser-provided WebGPU API is used.

/* eslint-disable @typescript-eslint/no-empty-interface */

interface GPUDevice {
  readonly limits: GPUSupportedLimits;
  readonly queue: GPUQueue;
  createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer;
  createShaderModule(descriptor: GPUShaderModuleDescriptor): GPUShaderModule;
  createComputePipeline(descriptor: GPUComputePipelineDescriptor): GPUComputePipeline;
  createBindGroup(descriptor: GPUBindGroupDescriptor): GPUBindGroup;
  createCommandEncoder(): GPUCommandEncoder;
  destroy(): void;
}

interface GPUSupportedLimits {
  readonly maxBufferSize: number;
}

interface GPUQueue {
  submit(commandBuffers: GPUCommandBuffer[]): void;
}

interface GPUBuffer {
  readonly size: number;
  getMappedRange(): ArrayBuffer;
  unmap(): void;
  mapAsync(mode: number): Promise<void>;
  destroy(): void;
}

interface GPUBufferDescriptor {
  size: number;
  usage: number;
  mappedAtCreation?: boolean;
}

interface GPUShaderModule {}

interface GPUShaderModuleDescriptor {
  code: string;
}

interface GPUComputePipeline {
  getBindGroupLayout(index: number): GPUBindGroupLayout;
}

interface GPUComputePipelineDescriptor {
  layout: 'auto' | GPUPipelineLayout;
  compute: GPUProgrammableStage;
}

interface GPUPipelineLayout {}

interface GPUProgrammableStage {
  module: GPUShaderModule;
  entryPoint: string;
}

interface GPUBindGroupLayout {}

interface GPUBindGroup {}

interface GPUBindGroupDescriptor {
  layout: GPUBindGroupLayout;
  entries: GPUBindGroupEntry[];
}

interface GPUBindGroupEntry {
  binding: number;
  resource: GPUBufferBinding | GPUSampler | GPUTextureView | GPUExternalTexture;
}

interface GPUBufferBinding {
  buffer: GPUBuffer;
  offset?: number;
  size?: number;
}

interface GPUSampler {}
interface GPUTextureView {}
interface GPUExternalTexture {}

interface GPUCommandEncoder {
  beginComputePass(): GPUComputePassEncoder;
  copyBufferToBuffer(
    source: GPUBuffer,
    sourceOffset: number,
    destination: GPUBuffer,
    destinationOffset: number,
    size: number,
  ): void;
  finish(): GPUCommandBuffer;
}

interface GPUComputePassEncoder {
  setPipeline(pipeline: GPUComputePipeline): void;
  setBindGroup(index: number, bindGroup: GPUBindGroup): void;
  dispatchWorkgroups(x: number, y?: number, z?: number): void;
  end(): void;
}

interface GPUCommandBuffer {}

interface GPUAdapter {
  requestDevice(): Promise<GPUDevice>;
}

interface GPU {
  requestAdapter(): Promise<GPUAdapter | null>;
}

declare const GPUBufferUsage: {
  readonly MAP_READ: number;
  readonly MAP_WRITE: number;
  readonly COPY_SRC: number;
  readonly COPY_DST: number;
  readonly INDEX: number;
  readonly VERTEX: number;
  readonly UNIFORM: number;
  readonly STORAGE: number;
  readonly INDIRECT: number;
  readonly QUERY_RESOLVE: number;
};

declare const GPUMapMode: {
  readonly READ: number;
  readonly WRITE: number;
};

interface Navigator {
  readonly gpu: GPU;
}
