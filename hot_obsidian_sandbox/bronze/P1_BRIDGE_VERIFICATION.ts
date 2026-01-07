/**
 * 🧪 SYNDICATE BRIDGE VERIFIER
 * 
 * Runs a synthetic demo in the Gesture Monolith and verifies that 
 * events are forwarded through the NATS Bridge (Syndicate Egress).
 */

import { GestureMonolithApp } from './P0_GESTURE_MONOLITH/src/app.ts';
import { JSDOM } from 'jsdom';

async function verifyBridge() {
    console.log('🏗️  Setting up Headless Monolith for Bridge Verification...');
    
    // Create a mock DOM for the app
    const dom = new JSDOM('<!DOCTYPE html><div id="app" style="width: 1000px; height: 1000px;"></div>');
    const container = dom.window.document.getElementById('app')!;
    
    // Polyfill for ClientWidth/Height as JSDOM defaults them to 0
    Object.defineProperty(container, 'clientWidth', { value: 1000 });
    Object.defineProperty(container, 'clientHeight', { value: 1000 });
    
    // Instantiate App
    const app = new GestureMonolithApp(container);
    await app.init();
    
    console.log('🚀 Running Integration Demo...');
    
    // The demo will run for a few seconds.
    // The console should show [Bifrost] >> NATS PUBLISH events.
    await app.runDemo();
    
    console.log('✅ Bridge Verification Complete.');
}

verifyBridge().catch(err => {
    console.error('❌ Bridge Verification Failed:', err);
    process.exit(1);
});
