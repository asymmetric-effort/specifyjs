// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { Color, ShadeParams } from './types';
import type { Light } from './light';
import type { Material } from './material';

/** Pluggable lighting model interface. */
export interface LightingModel {
  name: string;
  vertexShaderSource(): string;
  fragmentShaderSource(): string;
  shade(params: ShadeParams): Color;
  uniforms(lights: Light[], material: Material): Record<string, unknown>;
}

/**
 * Flat shading: returns the material color unchanged.
 * No diffuse/specular computation.
 */
export class FlatShading implements LightingModel {
  readonly name = 'FlatShading';

  vertexShaderSource(): string {
    return `
      precision highp float;
      attribute vec3 aPosition;
      uniform mat4 uModelViewProjection;
      void main() {
        gl_Position = uModelViewProjection * vec4(aPosition, 1.0);
      }
    `;
  }

  fragmentShaderSource(): string {
    return `
      precision mediump float;
      uniform vec4 uColor;
      void main() {
        gl_FragColor = uColor;
      }
    `;
  }

  shade(params: ShadeParams): Color {
    return { ...params.materialColor };
  }

  uniforms(_lights: Light[], material: Material): Record<string, unknown> {
    return {
      uColor: [material.color.r, material.color.g, material.color.b, material.color.a],
    };
  }
}

/**
 * Lambertian diffuse shading.
 * Computes intensity as max(dot(normal, lightDir), 0) and combines
 * an ambient term with a diffuse term.
 */
export class LambertianShading implements LightingModel {
  readonly name = 'lambertian';

  vertexShaderSource(): string {
    return `
      precision highp float;
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      uniform mat4 uModelViewProjection;
      uniform mat4 uModel;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      void main() {
        vNormal = mat3(uModel) * aNormal;
        vWorldPos = (uModel * vec4(aPosition, 1.0)).xyz;
        gl_Position = uModelViewProjection * vec4(aPosition, 1.0);
      }
    `;
  }

  fragmentShaderSource(): string {
    return `
      precision mediump float;
      uniform vec4 uColor;
      uniform vec3 uLightPos;
      uniform vec3 uLightColor;
      uniform float uAmbientStrength;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(uLightPos - vWorldPos);
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 ambient = uColor.rgb * uAmbientStrength;
        vec3 diffuse = uColor.rgb * uLightColor * diff;
        gl_FragColor = vec4(min(ambient + diffuse, vec3(1.0)), uColor.a);
      }
    `;
  }

  shade(params: ShadeParams): Color {
    const { normal, lightDir, lightColor, materialColor, ambientStrength } = params;

    const NdotL = Math.max(
      normal.x * lightDir.x + normal.y * lightDir.y + normal.z * lightDir.z,
      0,
    );

    return {
      r: Math.min(1, materialColor.r * ambientStrength + materialColor.r * lightColor.r * NdotL),
      g: Math.min(1, materialColor.g * ambientStrength + materialColor.g * lightColor.g * NdotL),
      b: Math.min(1, materialColor.b * ambientStrength + materialColor.b * lightColor.b * NdotL),
      a: materialColor.a,
    };
  }

  uniforms(lights: Light[], material: Material): Record<string, unknown> {
    const light = lights[0];
    return {
      uColor: [material.color.r, material.color.g, material.color.b, material.color.a],
      uLightPos: light ? [light.position.x, light.position.y, light.position.z] : [0, 10, 0],
      uLightColor: light ? [light.color.r, light.color.g, light.color.b] : [1, 1, 1],
      uAmbientStrength: 0.2,
    };
  }
}
