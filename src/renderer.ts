import {
  createCameraTexture,
  createProgram,
  createTarget,
  destroyTarget,
  type FramebufferTarget,
} from "./gl";
import quadVert from "./shaders/quad.vert?raw";
import phospheneFrag from "./shaders/phosphene.frag?raw";
import presentFrag from "./shaders/present.frag?raw";

export type FrameState = {
  time: number;
  mode: number;
  intensity: number;
  hold: number;
  hasCamera: boolean;
  video: HTMLVideoElement | null;
};

type Locations = {
  program: WebGLProgram;
  uniforms: Map<string, WebGLUniformLocation | null>;
};

function loc(gl: WebGL2RenderingContext, program: WebGLProgram, names: string[]): Locations {
  const uniforms = new Map<string, WebGLUniformLocation | null>();
  for (const name of names) {
    uniforms.set(name, gl.getUniformLocation(program, name));
  }
  return { program, uniforms };
}

function set1(gl: WebGL2RenderingContext, locations: Locations, name: string, value: number): void {
  const u = locations.uniforms.get(name);
  if (u) {
    gl.uniform1f(u, value);
  }
}

function set2(gl: WebGL2RenderingContext, locations: Locations, name: string, x: number, y: number): void {
  const u = locations.uniforms.get(name);
  if (u) {
    gl.uniform2f(u, x, y);
  }
}

export class Renderer {
  readonly canvas: HTMLCanvasElement;
  readonly gl: WebGL2RenderingContext;
  private readonly vao: WebGLVertexArrayObject;
  private readonly cameraTex: WebGLTexture;
  private readonly phosphene: Locations;
  private readonly present: Locations;
  private ping: FramebufferTarget;
  private pong: FramebufferTarget;
  private width = 1;
  private height = 1;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
    if (!gl) {
      throw new Error("WebGL2 is not available.");
    }
    this.canvas = canvas;
    this.gl = gl;

    gl.getExtension("EXT_color_buffer_float");
    gl.getExtension("EXT_color_buffer_half_float");
    gl.getExtension("OES_texture_half_float");
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const vao = gl.createVertexArray();
    if (!vao) {
      throw new Error("Could not create VAO.");
    }
    this.vao = vao;

    this.phosphene = loc(gl, createProgram(gl, quadVert, phospheneFrag), [
      "uCamera",
      "uPrev",
      "uResolution",
      "uCameraSize",
      "uTime",
      "uMode",
      "uIntensity",
      "uHold",
      "uHasCamera",
    ]);
    this.present = loc(gl, createProgram(gl, quadVert, presentFrag), [
      "uImage",
      "uResolution",
      "uTime",
    ]);

    this.cameraTex = createCameraTexture(gl);
    this.ping = createTarget(gl, 1, 1);
    this.pong = createTarget(gl, 1, 1);
    this.resize();
  }

  resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(this.canvas.clientWidth * dpr));
    const height = Math.max(1, Math.floor(this.canvas.clientHeight * dpr));
    if (width === this.width && height === this.height && this.canvas.width === width) {
      return;
    }
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
    const gl = this.gl;
    destroyTarget(gl, this.ping);
    destroyTarget(gl, this.pong);
    this.ping = createTarget(gl, width, height);
    this.pong = createTarget(gl, width, height);
  }

  frame(state: FrameState): void {
    this.resize();
    const gl = this.gl;
    const { width, height } = this;

    if (state.hasCamera && state.video && state.video.readyState >= 2) {
      gl.bindTexture(gl.TEXTURE_2D, this.cameraTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, state.video);
    }

    gl.bindVertexArray(this.vao);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.ping.framebuffer);
    gl.viewport(0, 0, width, height);
    gl.useProgram(this.phosphene.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.cameraTex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.pong.texture);
    const camW = state.video?.videoWidth || 1;
    const camH = state.video?.videoHeight || 1;
    gl.uniform1i(this.phosphene.uniforms.get("uCamera") ?? null, 0);
    gl.uniform1i(this.phosphene.uniforms.get("uPrev") ?? null, 1);
    set2(gl, this.phosphene, "uResolution", width, height);
    set2(gl, this.phosphene, "uCameraSize", camW, camH);
    set1(gl, this.phosphene, "uTime", state.time);
    set1(gl, this.phosphene, "uMode", state.mode);
    set1(gl, this.phosphene, "uIntensity", state.intensity);
    set1(gl, this.phosphene, "uHold", state.hold);
    set1(gl, this.phosphene, "uHasCamera", state.hasCamera ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, width, height);
    gl.useProgram(this.present.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.ping.texture);
    gl.uniform1i(this.present.uniforms.get("uImage") ?? null, 0);
    set2(gl, this.present, "uResolution", width, height);
    set1(gl, this.present, "uTime", state.time);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    const swap = this.ping;
    this.ping = this.pong;
    this.pong = swap;
  }
}
