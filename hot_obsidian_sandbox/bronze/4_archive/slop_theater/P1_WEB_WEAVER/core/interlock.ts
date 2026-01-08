/**
 * P1 WEB WEAVER - Silver Interlock
 * 
 * @port 1
 * @tier SILVER
 * @verb FUSE
 */

export function fuseLayers(layers: any[]): any {
  return layers.reduce((acc, layer) => ({ ...acc, ...layer }), {});
}
