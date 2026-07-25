import {test} from 'node:test';
import assert from 'node:assert/strict';
import {clampOpacity, scrollOpacity, pickWindowAt, OPACITY_MAX} from '../lib/transparency.js';

test('clampOpacity floors at minOpacity', () => {
    assert.equal(clampOpacity(10, 20), 20);
    assert.equal(clampOpacity(-100, 20), 20);
});

test('clampOpacity caps at OPACITY_MAX', () => {
    assert.equal(clampOpacity(300, 20), OPACITY_MAX);
    assert.equal(clampOpacity(255, 20), 255);
});

test('clampOpacity rounds to integer', () => {
    assert.equal(clampOpacity(199.6, 20), 200);
    assert.equal(clampOpacity(199.4, 20), 199);
});

test('scrollOpacity up increases and caps at 255', () => {
    assert.equal(scrollOpacity(200, 'up', 5, 20), 205);
    assert.equal(scrollOpacity(253, 'up', 5, 20), 255);
});

test('scrollOpacity down decreases and floors at minOpacity', () => {
    assert.equal(scrollOpacity(200, 'down', 5, 20), 195);
    assert.equal(scrollOpacity(22, 'down', 5, 20), 20);
});

test('scrollOpacity smooth: positive dy = more transparent, negative = more opaque', () => {
    assert.equal(scrollOpacity(200, 'smooth', 5, 20, 1), 195);
    assert.equal(scrollOpacity(200, 'smooth', 5, 20, -1), 205);
    // large positive delta clamps at min
    assert.equal(scrollOpacity(200, 'smooth', 5, 20, 100), 20);
});

test('scrollOpacity returns null for unhandled direction', () => {
    assert.equal(scrollOpacity(200, null, 5, 20), null);
    assert.equal(scrollOpacity(200, 'left', 5, 20), null);
});

test('pickWindowAt returns top-most hit (bottom-to-top order)', () => {
    const rects = [
        {x: 0, y: 0, width: 100, height: 100, id: 'bottom'},
        {x: 50, y: 50, width: 100, height: 100, id: 'top'},
    ];
    // Point in the overlap region -> top-most wins
    assert.equal(pickWindowAt(60, 60, rects).id, 'top');
    // Point only over the bottom window
    assert.equal(pickWindowAt(10, 10, rects).id, 'bottom');
});

test('pickWindowAt skips invisible windows', () => {
    const rects = [
        {x: 0, y: 0, width: 100, height: 100, id: 'visible'},
        {x: 0, y: 0, width: 100, height: 100, id: 'hidden', visible: false},
    ];
    assert.equal(pickWindowAt(10, 10, rects).id, 'visible');
});

test('pickWindowAt returns null when no window contains the point', () => {
    const rects = [{x: 0, y: 0, width: 10, height: 10, id: 'a'}];
    assert.equal(pickWindowAt(500, 500, rects), null);
});

test('pickWindowAt right/bottom edges are exclusive', () => {
    const rects = [{x: 0, y: 0, width: 100, height: 100, id: 'a'}];
    assert.equal(pickWindowAt(99, 99, rects).id, 'a');
    assert.equal(pickWindowAt(100, 100, rects), null); // x+width is outside
});
