/** A dependency-free floating lunar globe with continuous spherical texture sampling. */
export interface MoonRenderer {
  draw(yaw: number, pitch: number, zoom: number): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

const VERTEX = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;
const FRAGMENT = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_radius;
uniform vec2 u_rotation;
uniform sampler2D u_surface;
uniform sampler2D u_height;
const float PI = 3.14159265359;
vec2 surfaceUV(vec3 p) {
  return vec2(atan(p.x, p.z) / (2.0 * PI) + 0.5, asin(clamp(p.y, -1.0, 1.0)) / PI + 0.5);
}
void main() {
  vec2 xy = (gl_FragCoord.xy - u_resolution * 0.5) / u_radius;
  float rr = dot(xy, xy);
  if (rr > 1.0) { gl_FragColor = vec4(0.0); return; }
  vec3 n = vec3(xy, sqrt(max(0.0, 1.0 - rr)));
  float cy = cos(u_rotation.x), sy = sin(u_rotation.x);
  float cp = cos(u_rotation.y), sp = sin(u_rotation.y);
  // Inverse X rotation, then inverse Y rotation: lock the texture to landmarks.
  vec3 p = vec3(n.x, n.y * cp + n.z * sp, -n.y * sp + n.z * cp);
  p = vec3(p.x * cy - p.z * sy, p.y, p.x * sy + p.z * cy);
  vec2 uv = surfaceUV(p);
  vec3 terrain = texture2D(u_surface, uv).rgb;
  float dx = texture2D(u_height, uv + vec2(1.0 / 1024.0, 0.0)).r
           - texture2D(u_height, uv - vec2(1.0 / 1024.0, 0.0)).r;
  float dy = texture2D(u_height, uv + vec2(0.0, 1.0 / 512.0)).r
           - texture2D(u_height, uv - vec2(0.0, 1.0 / 512.0)).r;
  // Longitude has no direction at the poles: fade relief there instead of
  // normalizing a zero vector or introducing a biased tangent.
  vec3 tangent = vec3(p.z, 0.0, -p.x);
  tangent *= inversesqrt(max(dot(tangent, tangent), 0.000001));
  vec3 bitangent = cross(p, tangent);
  vec3 bump = normalize(p - tangent * dx * 0.7 - bitangent * dy * 0.7);
  bump = vec3(bump.x * cy + bump.z * sy, bump.y, -bump.x * sy + bump.z * cy);
  bump = vec3(bump.x, bump.y * cp - bump.z * sp, bump.y * sp + bump.z * cp);
  float sunlight = max(0.0, dot(bump, normalize(vec3(-0.78, 0.37, 0.58))));
  float illumination = 0.09 + 1.06 * pow(sunlight, 0.82);
  float limb = 0.88 + 0.12 * pow(n.z, 0.3);
  vec3 color = pow(terrain, vec3(1.06)) * illumination * limb * vec3(1.10, 1.06, 1.01);
  float edge = smoothstep(0.0, 1.4 / u_radius, 1.0 - sqrt(rr));
  gl_FragColor = vec4(color, edge);
}
`;

export function createMoonRenderer(canvas: HTMLCanvasElement, onTextureError?: () => void): MoonRenderer | null {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let texture: WebGLTexture | null = null;
  let heightTexture: WebGLTexture | null = null;
  const images: HTMLImageElement[] = [];
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    images.forEach(image => { image.onload = null; image.onerror = null; });
    if (texture) gl.deleteTexture(texture);
    if (heightTexture) gl.deleteTexture(heightTexture);
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    shaders.forEach(shader => gl.deleteShader(shader));
  };
  try {
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('Unable to create shader.');
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Unable to compile lunar shader.');
      return shader;
    };
    program = gl.createProgram();
    if (!program) throw new Error('Unable to create lunar program.');
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Unable to link lunar program.');
    gl.useProgram(program);
    buffer = gl.createBuffer();
    texture = gl.createTexture();
    if (!buffer || !texture) throw new Error('Unable to allocate lunar resources.');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    heightTexture = gl.createTexture();
    if (!heightTexture) throw new Error('Unable to allocate lunar height texture.');
    const initialize = (resource: WebGLTexture, unit: number) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, resource);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([185, 185, 182, 255]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };
    initialize(texture, 0);
    initialize(heightTexture, 1);
    gl.uniform1i(gl.getUniformLocation(program, 'u_surface'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'u_height'), 1);
    const resolution = gl.getUniformLocation(program, 'u_resolution');
    const radius = gl.getUniformLocation(program, 'u_radius');
    const rotation = gl.getUniformLocation(program, 'u_rotation');
    let width = 1, height = 1, dpr = 1;
    let lastView = { yaw: 0, pitch: -.04, zoom: 1.13 };
    const renderer: MoonRenderer = {
      resize(nextWidth, nextHeight) {
        if (disposed) return;
        width = Math.max(1, nextWidth);
        height = Math.max(1, nextHeight);
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
      },
      draw(yaw, pitch, zoom) {
        if (disposed || gl.isContextLost()) return;
        lastView = { yaw, pitch, zoom };
        gl.useProgram(program);
        gl.uniform2f(resolution, canvas.width, canvas.height);
        gl.uniform1f(radius, Math.min(width, height) * 0.43 * Math.max(0.01, zoom) * dpr);
        gl.uniform2f(rotation, yaw, pitch);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      },
      dispose,
    };
    const loadTexture = (url: string, resource: WebGLTexture, unit: number) => {
      const image = new Image();
      images.push(image);
      image.onload = () => {
        if (disposed || gl.isContextLost()) return;
        try {
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, resource);
          // NASA maps have north at the image top; GLSL v increases northward.
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          // atan wraps longitude from 1 to 0 at the map seam. Implicit mipmap
          // derivatives mistake that jump for heavy minification, creating a
          // blurred stripe (and a false ridge in the height map). Base-level
          // linear sampling keeps REPEAT interpolation continuous on WebGL 1.
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          // Redraw even when the OS has disabled automatic animation.
          renderer.draw(lastView.yaw, lastView.pitch, lastView.zoom);
        } catch { if (unit === 0) onTextureError?.(); }
      };
      image.onerror = () => { if (!disposed && unit === 0) onTextureError?.(); };
      image.src = url;
    };
    loadTexture('/images/moon/lroc-color-2k.jpg', texture, 0);
    loadTexture('/images/moon/lunar-height-1k.jpg', heightTexture, 1);
    return renderer;
  } catch {
    dispose();
    return null;
  }
}
