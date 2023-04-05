import { generate } from 'css-tree';

function noop() { }
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
    if (slot_changes) {
        const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
        slot.p(slot_context, slot_changes);
    }
}
function get_all_dirty_from_scope($$scope) {
    if ($$scope.ctx.length > 32) {
        const dirty = [];
        const length = $$scope.ctx.length / 32;
        for (let i = 0; i < length; i++) {
            dirty[i] = -1;
        }
        return dirty;
    }
    return -1;
}
function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    if (node.parentNode) {
        node.parentNode.removeChild(node);
    }
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_data(text, data) {
    data = '' + data;
    if (text.data === data)
        return;
    text.data = data;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
/**
 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
 * it can be called from an external module).
 *
 * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
 *
 * https://svelte.dev/docs#run-time-svelte-onmount
 */
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}

const dirty_components = [];
const binding_callbacks = [];
let render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = /* @__PURE__ */ Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();
let flushidx = 0; // Do *not* move this inside the flush() function
function flush() {
    // Do not reenter flush while dirty components are updated, as this can
    // result in an infinite loop. Instead, let the inner flush handle it.
    // Reentrancy is ok afterwards for bindings etc.
    if (flushidx !== 0) {
        return;
    }
    const saved_component = current_component;
    do {
        // first, call beforeUpdate functions
        // and update components
        try {
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
        }
        catch (e) {
            // reset dirty state to not end up in a deadlocked state and then rethrow
            dirty_components.length = 0;
            flushidx = 0;
            throw e;
        }
        set_current_component(null);
        dirty_components.length = 0;
        flushidx = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
/**
 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
 */
function flush_render_callbacks(fns) {
    const filtered = [];
    const targets = [];
    render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
    targets.forEach((c) => c());
    render_callbacks = filtered;
}
const outroing = new Set();
let outros;
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
    else if (callback) {
        callback();
    }
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
            // if the component was destroyed immediately
            // it will update the `$$.on_destroy` reference to `null`.
            // the destructured on_destroy may still reference to the old array
            if (component.$$.on_destroy) {
                component.$$.on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
    }
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        flush_render_callbacks($$.after_update);
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: [],
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false,
        root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor, options.customElement);
        flush();
    }
    set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        if (!is_function(callback)) {
            return noop;
        }
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

/**
 * Generate an array of HSL colors with interpolated values based on the given parameters
 * @param {Array<Range>} ranges - An array of objects representing the color ranges to generate
 * @returns {Array<Color>} An array of HSL colors
 */
function colorRange(ranges) {
    /**
     * Interpolate a value using the given curve parameters
     * @param {CurveParams} params - The curve parameters to use
     * @param {number} value - The value to interpolate
     * @returns {number} The interpolated value
     */
    const interpolateValue = (params, value) => {
        const [x1, y1] = params.points[0];
        const [x2, y2] = params.points[params.points.length - 1];
        if (value <= x1) {
            return params.start;
        }
        if (value >= x2) {
            return params.end;
        }
        let i = 0;
        while (params.points[i + 1][0] < value) {
            i++;
        }
        const [x0, y0] = params.points[i];
        const [x3, y3] = params.points[i + 1];
        const t = (value - x0) / (x3 - x0);
        const a = y3 - y2 - y0 + y1;
        const b = y0 - y1 - a;
        const c = y2 - y0;
        const d = y1;
        return a * t * t * t + b * t * t + c * t + d;
    };
    const colors = [];
    for (let j = 0; j < ranges.length; j++) {
        // TODO: Add support for color curves
        const { count, background, foreground, hueCurve = {
            start: 0,
            end: 360,
            points: [
                [0, 0],
                [360, 360],
            ],
        }, saturationCurve = {
            start: 0,
            end: 100,
            points: [
                [0, 0],
                [100, 100],
            ],
        }, lightnessCurve = {
            start: 0,
            end: 100,
            points: [
                [0, 0],
                [100, 100],
            ],
        }, } = ranges[j];
        const hueStep = (foreground.h - background.h) / count;
        const saturationStep = (foreground.s - background.s) / count;
        const lightStep = (foreground.l - background.l) / count;
        for (let i = j; i < count; i++) {
            const color = {
                h: background.h + hueStep * i,
                s: background.s + saturationStep * i,
                l: background.l + lightStep * i,
            };
            color.h = interpolateValue(hueCurve, color.h);
            color.s = interpolateValue(saturationCurve, color.s);
            color.l = interpolateValue(lightnessCurve, color.l);
            colors.push(color);
        }
        colors.push(foreground);
    }
    return colors;
}

/**
 * A helper object for generating color variants.
 * @typedef {Object} VariantHelper
 * @property {(color: Color) => Object[]} dark - Generates a dark color variant.
 * @property {(color: Color) => Object[]} light - Generates a light color variant.
 */
/**
 * Generates color variants for dark and light themes.
 * @type {VariantHelper}
 */
const variants = {
    /**
     * Generates a dark color variant.
     * @param {Color} color - The base color.
     * @returns {Object[]} An array of objects representing the color variant.
     */
    dark: (color) => {
        return [
            {
                count: 5,
                background: { h: color.h, s: color.s, l: 30 + color.l * 0.2 },
                foreground: { h: color.h, s: color.s, l: 15 + color.l * 0.2 },
            },
            {
                count: 5,
                background: { h: color.h, s: color.s, l: 15 + color.l * 0.2 },
                foreground: { h: color.h, s: color.s - 24, l: 0 },
            },
        ];
    },
    /**
     * Generates a light color variant.
     * @param {Color} color - The base color.
     * @returns {Object} An array of objects representing the color variant.
     */
    light: (color) => {
        return [
            {
                count: 5,
                background: {
                    h: color.h,
                    s: Math.min(0, color.s - 24),
                    l: 0,
                },
                foreground: color,
            },
            {
                count: 5,
                background: color,
                foreground: {
                    h: color.h,
                    s: color.s,
                    l: 100,
                },
            },
        ];
    },
};
/**
 * Converts HSL (Hue, Saturation, Lightness) values to a hexadecimal color notation.
 * @param {number} h - The hue value in degrees, between 0 and 359.
 * @param {number} s - The saturation value as a percentage, between 0 and 100.
 * @param {number} l - The lightness value as a percentage, between 0 and 100.
 * @returns {string} The hexadecimal color notation, in the format '#RRGGBB'.
 */
function hslToHex(h, s, l) {
    // Convert the hue, saturation, and lightness values to percentages
    const hue = h % 360;
    const saturation = s / 100;
    const lightness = l / 100;
    // Calculate the RGB values from the HSL values
    const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = lightness - c / 2;
    let r = 0, g = 0, b = 0;
    if (hue >= 0 && hue < 60) {
        r = c;
        g = x;
        b = 0;
    }
    else if (hue >= 60 && hue < 120) {
        r = x;
        g = c;
        b = 0;
    }
    else if (hue >= 120 && hue < 180) {
        r = 0;
        g = c;
        b = x;
    }
    else if (hue >= 180 && hue < 240) {
        r = 0;
        g = x;
        b = c;
    }
    else if (hue >= 240 && hue < 300) {
        r = x;
        g = 0;
        b = c;
    }
    else if (hue >= 300 && hue < 360) {
        r = c;
        g = 0;
        b = x;
    }
    // Convert the RGB values to hexadecimal notation
    const red = Math.round((r + m) * 255)
        .toString(16)
        .padStart(2, '0');
    const green = Math.round((g + m) * 255)
        .toString(16)
        .padStart(2, '0');
    const blue = Math.round((b + m) * 255)
        .toString(16)
        .padStart(2, '0');
    return `#${red}${green}${blue}`;
}
/**
 * Calculates the contrast ratio between two colors.
 * @param {string} color1 - The hexadecimal color code.
 * @param {string} color2 - The hexadecimal color code.
 * @returns {number} The relative luminance of the color.
 * @see https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function calculateContrastRatio(color1, color2) {
    // Convert the colors to their RGB values
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    // Calculate the relative luminance of each color
    const l1 = getRelativeLuminance(rgb1);
    const l2 = getRelativeLuminance(rgb2);
    // Calculate the contrast ratio
    const contrastRatio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    return contrastRatio;
}
/**
 * Converts hexadecimal color code to an RGB triplet.
 * @param {string} hex - The hexadecimal color code to convert.
 * @returns {[number, number, number]} An array containing the red, green, and blue values of the converted color.
 */
function hexToRgb(hex) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return [r, g, b];
}
/**
 * Returns the relative luminance of a color.
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 * @param {number[]} rgb - The RGB color values.
 * @returns {number} - The relative luminance of the color.
 */
function getRelativeLuminance(rgb) {
    // Convert the RGB values to sRGB
    const [r, g, b] = rgb.map(val => {
        const srgbVal = val / 255;
        return srgbVal <= 0.03928
            ? srgbVal / 12.92
            : Math.pow((srgbVal + 0.055) / 1.055, 2.4);
    });
    // Calculate the relative luminance using the sRGB values
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
/**
 * Returns an HSL color with adjusted lightness for better text visibility.
 * @see https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 * @param {Color} color - The input HSL color.
 * @returns {Color} - An HSL color with adjusted lightness.
 */
function getTextColor(color) {
    const contrastRatio = {
        '4.5': [],
        '7.5': [],
    };
    const findClosest = (arr, value) => {
        return arr.reduce((previous, current) => {
            return Math.abs(current - value) < Math.abs(previous - value)
                ? current
                : previous;
        });
    };
    for (let light = 0; light < 100; light++) {
        const ratio = calculateContrastRatio(hslToHex(color.h, color.s, color.l), hslToHex(color.h, color.s, light));
        if (ratio > 4.5) {
            contrastRatio['4.5'].push(light);
        }
        if (ratio > 7.5) {
            contrastRatio['7.5'].push(light);
        }
    }
    if (contrastRatio['7.5'].length > 0) {
        return {
            h: color.h,
            s: color.s,
            l: findClosest(contrastRatio['7.5'], color.l),
        };
    }
    return {
        h: color.h,
        s: color.s,
        l: findClosest(contrastRatio['4.5'], color.l),
    };
}
/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * @param  {number} r The red color value
 * @param  {number} g The green color value
 * @param  {number} b The blue color value
 * @return {Color}   The HSL representation
 */
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s
        ? l === r
            ? (g - b) / s
            : l === g
                ? 2 + (b - r) / s
                : 4 + (r - g) / s
        : 0;
    return {
        h: 60 * h < 0 ? 60 * h + 360 : 60 * h,
        s: 100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
        l: (100 * (2 * l - s)) / 2,
    };
}

/**
 * Gets the dominant color of an image within a specified area, based on a set of limits.
 * @param {Object} options - The options for the method.
 * @param {string} options.name - The ID of the parent element that contains the image.
 * @param {string} [options.target=img] - The type of element to search for within the parent element.
 * @param {Object} [options.limits] - The limits for the color values.
 * @param {Object} [options.limits.light] - The limits for the lightness value.
 * @param {number} [options.limits.light.gt=20] - The minimum lightness value.
 * @param {number} [options.limits.light.lt=80] - The maximum lightness value.
 * @param {Object} [options.limits.saturation] - The limits for the saturation value.
 * @param {number} [options.limits.saturation.gt=20] - The minimum saturation value.
 * @param {number} [options.limits.saturation.lt=90] - The maximum saturation value.
 * @param {Object} [options.limits.hue] - The limits for the hue value.
 * @param {number} [options.limits.hue.gt=0] - The minimum hue value.
 * @param {number} [options.limits.hue.lt=360] - The maximum hue value.
 * @param {Function} options.callback - The callback function to call with the result.
 * @param {number} [options.quality=10] - The quality of the sampling.
 * @param {Object} [options.position] - The position and size of the area to sample.
 * @param {number} [options.position.cx=0] - The X-coordinate of the top-left corner of the area to sample, as a percentage of the image width.
 * @param {number} [options.position.cy=0] - The Y-coordinate of the top-left corner of the area to sample, as a percentage of the image height.
 * @param {number} [options.position.width=100] - The width of the area to sample, as a percentage of the image width.
 * @param {number} [options.position.height=100] - The height of the area to sample, as a percentage of the image height.
 */
function getImageColor({ name, target, limits = {
    light: {
        gt: 20,
        lt: 80,
    },
    saturation: {
        gt: 20,
        lt: 90,
    },
    hue: {
        gt: 0,
        lt: 360,
    },
}, callback, quality = 10, position = {
    cx: 0,
    cy: 0,
    width: 100,
    height: 100,
}, }) {
    try {
        const { src } = document.querySelector(`#${name} ${target || 'img'}`);
        // Create a new image object
        const image = new Image();
        // Set the image source to the same as the provided image
        image.src = src;
        // Wait for the image to load
        image.onload = function () {
            const canvas = document.createElement('canvas');
            const getPercent = (value, percent) => {
                if (percent >= 0) {
                    return (value * percent) / 100;
                }
                else {
                    return value;
                }
            };
            canvas.width = getPercent(image.width, position.width || 100);
            canvas.height = getPercent(image.height, position.height || 100);
            const context = canvas.getContext('2d');
            if (!context)
                throw new Error('Could not get canvas context');
            context.drawImage(image, (image.width * position.cx) / 100, (image.height * position.cy) / 100, canvas.width, canvas.height);
            // Get the primary color of the image using the Canvas API
            const { data } = context.getImageData(getPercent(image.width, position.cx), getPercent(image.height, position.cy), canvas.width, canvas.height);
            const counts = {};
            let max = 0;
            let dominant = [0, 0, 0];
            for (let cursor = 0; cursor < data.length; cursor += 4 * quality) {
                const [r, g, b] = data.slice(cursor, cursor + 3);
                const color = rgbToHsl(r, g, b);
                const hue = Math.floor(color.h);
                if (!counts[hue]) {
                    counts[hue] = 0;
                }
                counts[hue]++;
                if (counts[hue] > max) {
                    if (color.l > limits.light.gt &&
                        color.l < limits.light.lt &&
                        color.s > limits.saturation.gt &&
                        color.s < limits.saturation.lt &&
                        color.h < limits.hue.lt &&
                        color.h > limits.hue.gt) {
                        max = counts[hue];
                        dominant = [r, g, b];
                    }
                }
            }
            callback({
                color: rgbToHsl(dominant[0], dominant[1], dominant[2]),
            });
        };
    }
    catch (error) {
        console.error(error);
        callback({ color: { h: 0, s: 0, l: 0 } });
    }
}

var SelectorType;
(function (SelectorType) {
    SelectorType["PseudoClassSelector"] = "PseudoClassSelector";
    SelectorType["IdSelector"] = "IdSelector";
    SelectorType["ClassSelector"] = "ClassSelector";
    SelectorType["AttributeSelector"] = "AttributeSelector";
})(SelectorType || (SelectorType = {}));

/**
 * @fileoverview A utility for converting values into the CSS tree format.
 * @see https://github.com/csstree/csstree
 * @see https://github.com/csstree/csstree/blob/master/docs/ast.md
 */
/**
 * Returns the type of CSS selector based on the provided target string.
 * @param {string} target The target string to check.
 * @returns {string} The type of CSS selector.
 */
const getSelectorType = (target) => {
    switch (target[0]) {
        case ':':
            return SelectorType.PseudoClassSelector;
        case '#':
            return SelectorType.IdSelector;
        case '.':
            return SelectorType.ClassSelector;
        case '[':
            return SelectorType.AttributeSelector;
        default:
            return SelectorType.PseudoClassSelector;
    }
};
/**
 * Normalizes the provided CSS selector by removing any prefix that indicates the type of selector.
 * @param {string} target The CSS selector to normalize.
 * @returns {string} The normalized CSS selector.
 */
const normalizeSelector = (target) => {
    switch (target[0]) {
        case ':':
        case '#':
        case '.':
            return target.slice(1);
        case '[':
            return target.slice(1, -1);
        default:
            return target;
    }
};
const toCssTree = {
    /**
     * Creates a CSS declaration token.
     * @param {string} token - The name of the CSS property.
     * @param {string} value - The value of the CSS property.
     * @returns {Declaration} - A CSS declaration token.
     */
    token: (token, value) => {
        return {
            type: 'Declaration',
            important: false,
            property: `--${token}`,
            value: {
                type: 'Raw',
                value,
            },
        };
    },
    tokens: {
        scheme: {
            /**
             * Converts the provided tokens and target string to a CSS tree node for the light theme.
             * @param {Declaration[]} tokens The CSS tokens to include in the node.
             * @param {string} target The target selector for the node.
             * @returns {Object} The CSS tree node for the light theme.
             */
            light: (tokens, target) => ({
                type: 'Rule',
                prelude: {
                    type: 'SelectorList',
                    children: [
                        {
                            type: 'Selector',
                            children: [
                                {
                                    type: getSelectorType(target),
                                    name: normalizeSelector(target),
                                    children: null,
                                },
                            ],
                        },
                    ],
                },
                block: {
                    type: 'Block',
                    children: tokens,
                },
            }),
            /**
             * Converts the provided tokens and target string to a CSS tree node for the dark theme.
             * @param {Declaration[]} tokens The CSS tokens to include in the node.
             * @param {string} target The target selector for the node.
             * @returns {Object} The CSS tree node for the dark theme.
             */
            dark: (tokens, target) => ({
                type: 'Atrule',
                name: 'media',
                prelude: {
                    type: 'AtrulePrelude',
                    children: [
                        {
                            type: 'MediaQueryList',
                            children: [
                                {
                                    type: 'MediaQuery',
                                    children: [
                                        {
                                            type: 'MediaFeature',
                                            name: 'prefers-color-scheme',
                                            value: {
                                                type: 'Identifier',
                                                name: 'dark',
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                block: {
                    type: 'Block',
                    children: [
                        {
                            type: 'Rule',
                            prelude: {
                                type: 'SelectorList',
                                children: [
                                    {
                                        type: 'Selector',
                                        children: [
                                            {
                                                type: getSelectorType(target),
                                                name: normalizeSelector(target),
                                                children: null,
                                            },
                                        ],
                                    },
                                ],
                            },
                            block: {
                                type: 'Block',
                                children: tokens,
                            },
                        },
                    ],
                },
            }),
        },
    },
    /**
     * A function that takes a selector name, property, and selector type and returns a CSS tree object
     * representing the rule.
     * @param {string|{ type: string; name: string }} name - The name of the selector or an object containing
     *   the type and name of the selector.
     * @param {string} property - The property of the rule.
     * @param {string} selectorType - The type of the selector.
     * @returns {Object} A CSS tree object representing the rule.
     */
    selector: (name, property, selectorType) => {
        return {
            type: 'Rule',
            prelude: {
                type: 'SelectorList',
                children: [
                    {
                        type: 'Selector',
                        children: [
                            {
                                type: selectorType,
                                name: name,
                                matcher: null,
                                value: null,
                                flags: null,
                            },
                        ],
                    },
                ],
            },
            block: {
                type: 'Block',
                children: [
                    {
                        type: 'Declaration',
                        important: false,
                        property: property,
                        value: {
                            type: 'Value',
                            children: [
                                typeof name === 'string'
                                    ? {
                                        type: 'Function',
                                        name: 'var',
                                        children: [
                                            {
                                                type: 'Identifier',
                                                name: `--${name}`,
                                            },
                                        ],
                                    }
                                    : {
                                        type: 'Function',
                                        name: 'var',
                                        children: [
                                            {
                                                type: 'Identifier',
                                                name: `--${name.name}`,
                                            },
                                        ],
                                    },
                            ],
                        },
                    },
                ],
            },
        };
    },
};

/**
 * @fileoverview A file for creating tokens for a CSS color scheme.
 */
/**
 * Creates a token for a CSS color scheme with the given name and token colors.
 * @param {string} name - The name of the token.
 * @param {Object} colors - The token colors object, containing light and dark properties.
 * @param {Color} colors.light - The light mode color in HSL format.
 * @param {Color} colors.dark - The dark mode color in HSL format. Optional.
 * @returns {Object} The token object containing light and dark properties.
 * @returns {Object} The token object.light - The light mode token object.
 * @returns {Object} The token object.dark - The dark mode token object. Can be null if dark color is not provided.
 */
function cssToken(name, { light, dark }) {
    /**
     * Converts a color object to a string.
     * @param {Color} color Hsl formatted color
     * @returns {string} Hsl formatted color as string
     */
    const hslToString = (color) => {
        const { h, s, l } = color;
        return `${h.toFixed(2)} ${s.toFixed(2)}% ${l.toFixed(2)}%`;
    };
    const { token } = toCssTree;
    const tokenName = `${name}-hsl`;
    const value = `hsl(var(--${tokenName}))`;
    if (dark) {
        return {
            light: [token(tokenName, hslToString(light)), token(name, value)],
            dark: [token(tokenName, hslToString(dark)), token(name, value)],
        };
    }
    return {
        light: [token(tokenName, hslToString(light)), token(name, value)],
        dark: null,
    };
}

/**
 * @fileoverview This module exports a `radioColor` module, which is responsible
 * for generating a set of CSS color tokens based on the given options.
 */
/**
 * @typedef {Object} TokenTheme
 * @property {function} TokenTheme - Returns an array of CSS declaration objects.
 * @property {Color} TokenTheme.color - The color to use for the token.
 * @property {string} TokenTheme.name - The name of the token.
 * @property {boolean} TokenTheme.font - Whether to generate a font color token.
 * @property {boolean} TokenTheme.dark - Whether to generate a dark color token.
 * @property {boolean} TokenTheme.light - Whether to generate a light color token.
 * @property {string} TokenTheme.target - The target selector for the token.
 */
const radioColor = function () {
    const attributes = [];
    const classes = [];
    const tokens = {
        light: [],
        dark: [],
    };
    let styles = '';
    let target = ':root';
    /**
     * Sets the colors for the color system
     * @param {ColorOptions[]} colorsOptions - An array of color options
     * @returns {void}
     */
    const setColors = (colorsOptions) => {
        for (const { prefix = '', color, name = 'primary', suffix = '', dark = true, font = true, selector = { attribute: true, class: true }, theme = {
            darken: variants.dark,
            lighten: variants.light,
        }, } of colorsOptions) {
            const { darken = variants.dark, lighten = variants.light } = theme;
            const ranges = {
                light: colorRange(lighten(color)),
                dark: colorRange(darken(color)),
            };
            for (let i = 0; i < ranges.light.length; i++) {
                const lightSegment = ranges.light[i];
                const darkSegment = ranges.dark[i];
                const names = {
                    text: `${prefix}${name}-font-${i * 10}${suffix}`,
                    background: `${prefix}${name}-${i * 10}${suffix}`,
                };
                setTokens({ dark: dark ? darkSegment : null, light: lightSegment, font }, names);
                if (selector.attribute)
                    setAttributes(names, font, selector.attribute);
                if (selector.class)
                    setClasses(names, font, selector.class);
            }
        }
        const { light, dark } = toCssTree.tokens.scheme;
        styles = generate({
            type: 'StyleSheet',
            // TODO: Update the used tree, or clone it before using it.
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            children: [
                light(tokens.light, target),
                dark(tokens.dark, target),
                ...classes,
                ...attributes,
            ],
        });
    };
    /**
     * Sets the tokens for the color system
     * @param {TokenTheme} theme - The color theme
     * @param {TokenNames} tokenNames - The names of the tokens
     * @returns {void}
     */
    const setTokens = (theme, { background, text }) => {
        if (theme.dark) {
            const { light, dark } = cssToken(background, {
                light: theme.light,
                dark: theme.dark,
            });
            tokens.light = [...tokens.light, ...light];
            if (dark)
                tokens.dark = [...tokens.dark, ...dark];
        }
        else {
            const { light } = cssToken(background, {
                light: theme.light,
            });
            tokens.light = [...tokens.light, ...light];
        }
        if (theme.font) {
            if (theme.dark) {
                const { light, dark } = cssToken(text, {
                    light: getTextColor(theme.light),
                    dark: getTextColor(theme.dark),
                });
                tokens.light = [...tokens.light, ...light];
                if (dark)
                    tokens.dark = [...tokens.dark, ...dark];
            }
            else {
                const { light } = cssToken(text, {
                    light: getTextColor(theme.light),
                });
                tokens.light = [...tokens.light, ...light];
            }
        }
    };
    /**
     * Sets the css attributes
     * @param {TokenNames} tokenNames - The names of the tokens
     * @param {boolean} font - If the font color should be set
     * @param {boolean} selector - CSS tree selector type
     * @returns {void}
     */
    const setAttributes = ({ background, text }, font, selector) => {
        if (selector) {
            attributes.push(toCssTree.selector({
                type: 'Identifier',
                name: background,
            }, 'background-color', 'AttributeSelector'));
            if (font) {
                attributes.push(toCssTree.selector({
                    type: 'Identifier',
                    name: text,
                }, 'color', 'AttributeSelector'));
            }
        }
    };
    /**
     * Sets the css classes
     * @param {TokenNames} tokenNames - The names of the tokens
     * @param {boolean} font - If the font color should be set
     * @param {boolean} selector - CSS tree selector type
     * @returns {void}
     */
    const setClasses = ({ background, text }, font, selector) => {
        if (selector) {
            classes.push(toCssTree.selector(background, 'background-color', 'ClassSelector'));
            if (font) {
                classes.push(toCssTree.selector(text, 'color', 'ClassSelector'));
            }
        }
    };
    /**
     * Returns the stylesheet
     * @returns {string} - The stylesheet
     */
    const stylesheet = () => {
        return styles;
    };
    /**
     * Sets the target for the stylesheet
     * @param {string} t - The target
     * @returns {void}
     */
    const setTarget = (t) => {
        target = t;
    };
    return {
        setColors,
        setTokens,
        setTarget,
        setAttributes,
        stylesheet,
    };
};

/* src/components/RadioActive.svelte generated by Svelte v3.58.0 */

function create_fragment$1(ctx) {
	let style_1;
	let t0;
	let t1;
	let div;
	let div_id_value;
	let current;
	const default_slot_template = /*#slots*/ ctx[6].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

	return {
		c() {
			style_1 = element("style");
			t0 = text(/*style*/ ctx[1]);
			t1 = space();
			div = element("div");
			if (default_slot) default_slot.c();
			attr(div, "id", div_id_value = /*color*/ ctx[0].name);
		},
		m(target, anchor) {
			insert(target, style_1, anchor);
			append(style_1, t0);
			insert(target, t1, anchor);
			insert(target, div, anchor);

			if (default_slot) {
				default_slot.m(div, null);
			}

			current = true;
		},
		p(ctx, [dirty]) {
			if (!current || dirty & /*style*/ 2) set_data(t0, /*style*/ ctx[1]);

			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[5],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*color*/ 1 && div_id_value !== (div_id_value = /*color*/ ctx[0].name)) {
				attr(div, "id", div_id_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(style_1);
			if (detaching) detach(t1);
			if (detaching) detach(div);
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { target = '' } = $$props;
	let { async = false } = $$props;

	let { color = {
		color: { h: 0, s: 0, l: 50 },
		name: 'dynamic'
	} } = $$props;

	const { setTarget, setColors, stylesheet } = radioColor();
	let style = '';
	let mounted = false;

	if (color.name !== undefined) {
		setTarget(`#${color.name}`);
	}

	if (async === false) {
		setColors([color]);
		style = stylesheet();
	}

	onMount(() => {
		$$invalidate(4, mounted = true);
	});

	$$self.$$set = $$props => {
		if ('target' in $$props) $$invalidate(2, target = $$props.target);
		if ('async' in $$props) $$invalidate(3, async = $$props.async);
		if ('color' in $$props) $$invalidate(0, color = $$props.color);
		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*mounted, color, target*/ 21) {
			if (mounted) {
				getImageColor({
					name: color.name || '',
					target,
					callback: c => {
						setColors([Object.assign(Object.assign({}, color), { color: c.color })]);
						$$invalidate(1, style = stylesheet());
					}
				});
			}
		}
	};

	return [color, style, target, async, mounted, $$scope, slots];
}

class RadioActive extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { target: 2, async: 3, color: 0 });
	}
}

/* src/components/RadioStatic.svelte generated by Svelte v3.58.0 */

function create_fragment(ctx) {
	let style_1;
	let t0;
	let t1;
	let current;
	const default_slot_template = /*#slots*/ ctx[6].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

	return {
		c() {
			style_1 = element("style");
			t0 = text(/*style*/ ctx[0]);
			t1 = space();
			if (default_slot) default_slot.c();
		},
		m(target, anchor) {
			insert(target, style_1, anchor);
			append(style_1, t0);
			insert(target, t1, anchor);

			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p(ctx, [dirty]) {
			if (!current || dirty & /*style*/ 1) set_data(t0, /*style*/ ctx[0]);

			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[5],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
						null
					);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(style_1);
			if (detaching) detach(t1);
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { colors = [] } = $$props;
	let { target = '' } = $$props;
	let { async = false } = $$props;
	let style = '';
	let mounted = false;
	const { setTarget, setColors, stylesheet } = radioColor();

	onMount(() => {
		$$invalidate(4, mounted = true);
	});

	$$self.$$set = $$props => {
		if ('colors' in $$props) $$invalidate(1, colors = $$props.colors);
		if ('target' in $$props) $$invalidate(2, target = $$props.target);
		if ('async' in $$props) $$invalidate(3, async = $$props.async);
		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*async, colors, target*/ 14) {
			if (async === false) {
				setColors(colors);
				$$invalidate(0, style = stylesheet());

				if (target !== undefined) {
					setTarget(target);
				}
			}
		}

		if ($$self.$$.dirty & /*async, mounted, colors, target*/ 30) {
			if (async === true && mounted === true) {
				setColors(colors);

				if (target !== undefined) {
					setTarget(target);
				}

				$$invalidate(0, style = stylesheet());
			}
		}
	};

	return [style, colors, target, async, mounted, $$scope, slots];
}

class RadioStatic extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { colors: 1, target: 2, async: 3 });
	}
}

var index = {
    RadioActive,
    RadioStatic,
};

export { index as default };
