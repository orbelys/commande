var Ud = Object.defineProperty;
var Jd = (r, e, t) => e in r ? Ud(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var M = (r, e, t) => Jd(r, typeof e != "symbol" ? e + "" : e, t);
const jd = () => {
};
const Ch = function(r) {
  const e = [];
  let t = 0;
  for (let n = 0; n < r.length; n++) {
    let s = r.charCodeAt(n);
    s < 128 ? e[t++] = s : s < 2048 ? (e[t++] = s >> 6 | 192, e[t++] = s & 63 | 128) : (s & 64512) === 55296 && n + 1 < r.length && (r.charCodeAt(n + 1) & 64512) === 56320 ? (s = 65536 + ((s & 1023) << 10) + (r.charCodeAt(++n) & 1023), e[t++] = s >> 18 | 240, e[t++] = s >> 12 & 63 | 128, e[t++] = s >> 6 & 63 | 128, e[t++] = s & 63 | 128) : (e[t++] = s >> 12 | 224, e[t++] = s >> 6 & 63 | 128, e[t++] = s & 63 | 128);
  }
  return e;
}, qd = function(r) {
  const e = [];
  let t = 0, n = 0;
  for (; t < r.length; ) {
    const s = r[t++];
    if (s < 128)
      e[n++] = String.fromCharCode(s);
    else if (s > 191 && s < 224) {
      const i = r[t++];
      e[n++] = String.fromCharCode((s & 31) << 6 | i & 63);
    } else if (s > 239 && s < 365) {
      const i = r[t++], o = r[t++], B = r[t++], u = ((s & 7) << 18 | (i & 63) << 12 | (o & 63) << 6 | B & 63) - 65536;
      e[n++] = String.fromCharCode(55296 + (u >> 10)), e[n++] = String.fromCharCode(56320 + (u & 1023));
    } else {
      const i = r[t++], o = r[t++];
      e[n++] = String.fromCharCode((s & 15) << 12 | (i & 63) << 6 | o & 63);
    }
  }
  return e.join("");
}, fh = {
  /**
   * Maps bytes to characters.
   */
  byteToCharMap_: null,
  /**
   * Maps characters to bytes.
   */
  charToByteMap_: null,
  /**
   * Maps bytes to websafe characters.
   * @private
   */
  byteToCharMapWebSafe_: null,
  /**
   * Maps websafe characters to bytes.
   * @private
   */
  charToByteMapWebSafe_: null,
  /**
   * Our default alphabet, shared between
   * ENCODED_VALS and ENCODED_VALS_WEBSAFE
   */
  ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  /**
   * Our default alphabet. Value 64 (=) is special; it means "nothing."
   */
  get ENCODED_VALS() {
    return this.ENCODED_VALS_BASE + "+/=";
  },
  /**
   * Our websafe alphabet.
   */
  get ENCODED_VALS_WEBSAFE() {
    return this.ENCODED_VALS_BASE + "-_.";
  },
  /**
   * Whether this browser supports the atob and btoa functions. This extension
   * started at Mozilla but is now implemented by many browsers. We use the
   * ASSUME_* variables to avoid pulling in the full useragent detection library
   * but still allowing the standard per-browser compilations.
   *
   */
  HAS_NATIVE_SUPPORT: typeof atob == "function",
  /**
   * Base64-encode an array of bytes.
   *
   * @param input An array of bytes (numbers with
   *     value in [0, 255]) to encode.
   * @param webSafe Boolean indicating we should use the
   *     alternative alphabet.
   * @return The base64 encoded string.
   */
  encodeByteArray(r, e) {
    if (!Array.isArray(r))
      throw Error("encodeByteArray takes an array as a parameter");
    this.init_();
    const t = e ? this.byteToCharMapWebSafe_ : this.byteToCharMap_, n = [];
    for (let s = 0; s < r.length; s += 3) {
      const i = r[s], o = s + 1 < r.length, B = o ? r[s + 1] : 0, u = s + 2 < r.length, c = u ? r[s + 2] : 0, C = i >> 2, f = (i & 3) << 4 | B >> 4;
      let m = (B & 15) << 2 | c >> 6, R = c & 63;
      u || (R = 64, o || (m = 64)), n.push(t[C], t[f], t[m], t[R]);
    }
    return n.join("");
  },
  /**
   * Base64-encode a string.
   *
   * @param input A string to encode.
   * @param webSafe If true, we should use the
   *     alternative alphabet.
   * @return The base64 encoded string.
   */
  encodeString(r, e) {
    return this.HAS_NATIVE_SUPPORT && !e ? btoa(r) : this.encodeByteArray(Ch(r), e);
  },
  /**
   * Base64-decode a string.
   *
   * @param input to decode.
   * @param webSafe True if we should use the
   *     alternative alphabet.
   * @return string representing the decoded value.
   */
  decodeString(r, e) {
    return this.HAS_NATIVE_SUPPORT && !e ? atob(r) : qd(this.decodeStringToByteArray(r, e));
  },
  /**
   * Base64-decode a string.
   *
   * In base-64 decoding, groups of four characters are converted into three
   * bytes.  If the encoder did not apply padding, the input length may not
   * be a multiple of 4.
   *
   * In this case, the last group will have fewer than 4 characters, and
   * padding will be inferred.  If the group has one or two characters, it decodes
   * to one byte.  If the group has three characters, it decodes to two bytes.
   *
   * @param input Input to decode.
   * @param webSafe True if we should use the web-safe alphabet.
   * @return bytes representing the decoded value.
   */
  decodeStringToByteArray(r, e) {
    this.init_();
    const t = e ? this.charToByteMapWebSafe_ : this.charToByteMap_, n = [];
    for (let s = 0; s < r.length; ) {
      const i = t[r.charAt(s++)], B = s < r.length ? t[r.charAt(s)] : 0;
      ++s;
      const c = s < r.length ? t[r.charAt(s)] : 64;
      ++s;
      const f = s < r.length ? t[r.charAt(s)] : 64;
      if (++s, i == null || B == null || c == null || f == null)
        throw new Kd();
      const m = i << 2 | B >> 4;
      if (n.push(m), c !== 64) {
        const R = B << 4 & 240 | c >> 2;
        if (n.push(R), f !== 64) {
          const P = c << 6 & 192 | f;
          n.push(P);
        }
      }
    }
    return n;
  },
  /**
   * Lazy static initialization function. Called before
   * accessing any of the static map variables.
   * @private
   */
  init_() {
    if (!this.byteToCharMap_) {
      this.byteToCharMap_ = {}, this.charToByteMap_ = {}, this.byteToCharMapWebSafe_ = {}, this.charToByteMapWebSafe_ = {};
      for (let r = 0; r < this.ENCODED_VALS.length; r++)
        this.byteToCharMap_[r] = this.ENCODED_VALS.charAt(r), this.charToByteMap_[this.byteToCharMap_[r]] = r, this.byteToCharMapWebSafe_[r] = this.ENCODED_VALS_WEBSAFE.charAt(r), this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[r]] = r, r >= this.ENCODED_VALS_BASE.length && (this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(r)] = r, this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(r)] = r);
    }
  }
};
class Kd extends Error {
  constructor() {
    super(...arguments), this.name = "DecodeBase64StringError";
  }
}
const zd = function(r) {
  const e = Ch(r);
  return fh.encodeByteArray(e, !0);
}, Wi = function(r) {
  return zd(r).replace(/\./g, "");
}, dh = function(r) {
  try {
    return fh.decodeString(r, !0);
  } catch (e) {
    console.error("base64Decode failed: ", e);
  }
  return null;
};
function Qd() {
  if (typeof self < "u")
    return self;
  if (typeof window < "u")
    return window;
  if (typeof global < "u")
    return global;
  throw new Error("Unable to locate global object.");
}
const Wd = () => Qd().__FIREBASE_DEFAULTS__, $d = () => {
  if (typeof process > "u" || typeof process.env > "u")
    return;
  const r = process.env.__FIREBASE_DEFAULTS__;
  if (r)
    return JSON.parse(r);
}, Yd = () => {
  if (typeof document > "u")
    return;
  let r;
  try {
    r = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
  } catch {
    return;
  }
  const e = r && dh(r[1]);
  return e && JSON.parse(e);
}, Eo = () => {
  try {
    return jd() || Wd() || $d() || Yd();
  } catch (r) {
    console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${r}`);
    return;
  }
}, ph = (r) => Eo()?.emulatorHosts?.[r], Xd = (r) => {
  const e = ph(r);
  if (!e)
    return;
  const t = e.lastIndexOf(":");
  if (t <= 0 || t + 1 === e.length)
    throw new Error(`Invalid host ${e} with no separate hostname and port!`);
  const n = parseInt(e.substring(t + 1), 10);
  return e[0] === "[" ? [e.substring(1, t - 1), n] : [e.substring(0, t), n];
}, gh = () => Eo()?.config, mh = (r) => Eo()?.[`_${r}`];
class Eh {
  constructor() {
    this.reject = () => {
    }, this.resolve = () => {
    }, this.promise = new Promise((e, t) => {
      this.resolve = e, this.reject = t;
    });
  }
  /**
   * Our API internals are not promisified and cannot because our callback APIs have subtle expectations around
   * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
   * and returns a node-style callback which will resolve or reject the Deferred's promise.
   */
  wrapCallback(e) {
    return (t, n) => {
      t ? this.reject(t) : this.resolve(n), typeof e == "function" && (this.promise.catch(() => {
      }), e.length === 1 ? e(t) : e(t, n));
    };
  }
}
function Zd(r, e) {
  if (r.uid)
    throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');
  const t = {
    alg: "none",
    type: "JWT"
  }, n = e || "demo-project", s = r.iat || 0, i = r.sub || r.user_id;
  if (!i)
    throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");
  const o = {
    // Set all required fields to decent defaults
    iss: `https://securetoken.google.com/${n}`,
    aud: n,
    iat: s,
    exp: s + 3600,
    auth_time: s,
    sub: i,
    user_id: i,
    firebase: {
      sign_in_provider: "custom",
      identities: {}
    },
    // Override with user options
    ...r
  };
  return [
    Wi(JSON.stringify(t)),
    Wi(JSON.stringify(o)),
    ""
  ].join(".");
}
function Qe() {
  return typeof navigator < "u" && typeof navigator.userAgent == "string" ? navigator.userAgent : "";
}
function ep() {
  return typeof window < "u" && // @ts-ignore Setting up an broadly applicable index signature for Window
  // just to deal with this case would probably be a bad idea.
  !!(window.cordova || window.phonegap || window.PhoneGap) && /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Qe());
}
function tp() {
  const r = Eo()?.forceEnvironment;
  if (r === "node")
    return !0;
  if (r === "browser")
    return !1;
  try {
    return Object.prototype.toString.call(global.process) === "[object process]";
  } catch {
    return !1;
  }
}
function np() {
  return typeof navigator < "u" && navigator.userAgent === "Cloudflare-Workers";
}
function rp() {
  const r = typeof chrome == "object" ? chrome.runtime : typeof browser == "object" ? browser.runtime : void 0;
  return typeof r == "object" && r.id !== void 0;
}
function sp() {
  return typeof navigator == "object" && navigator.product === "ReactNative";
}
function ip() {
  const r = Qe();
  return r.indexOf("MSIE ") >= 0 || r.indexOf("Trident/") >= 0;
}
function op() {
  return !tp() && !!navigator.userAgent && navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome");
}
function ap() {
  try {
    return typeof indexedDB == "object";
  } catch {
    return !1;
  }
}
function Bp() {
  return new Promise((r, e) => {
    try {
      let t = !0;
      const n = "validate-browser-context-for-indexeddb-analytics-module", s = self.indexedDB.open(n);
      s.onsuccess = () => {
        s.result.close(), t || self.indexedDB.deleteDatabase(n), r(!0);
      }, s.onupgradeneeded = () => {
        t = !1;
      }, s.onerror = () => {
        e(s.error?.message || "");
      };
    } catch (t) {
      e(t);
    }
  });
}
const up = "FirebaseError";
class $t extends Error {
  constructor(e, t, n) {
    super(t), this.code = e, this.customData = n, this.name = up, Object.setPrototypeOf(this, $t.prototype), Error.captureStackTrace && Error.captureStackTrace(this, Ks.prototype.create);
  }
}
class Ks {
  constructor(e, t, n) {
    this.service = e, this.serviceName = t, this.errors = n;
  }
  create(e, ...t) {
    const n = t[0] || {}, s = `${this.service}/${e}`, i = this.errors[e], o = i ? cp(i, n) : "Error", B = `${this.serviceName}: ${o} (${s}).`;
    return new $t(s, B, n);
  }
}
function cp(r, e) {
  try {
    let t = 0, n = "";
    for (; t < r.length; ) {
      const s = r.indexOf("{$", t);
      if (s === -1) {
        n += r.substring(t);
        break;
      }
      const i = r.indexOf("}", s + 2);
      if (i === -1) {
        n += r.substring(t);
        break;
      }
      const o = r.substring(s + 2, i), B = e[o];
      n += r.substring(t, s) + (B != null ? String(B) : `<${o}?>`), t = i + 1;
    }
    return n;
  } catch {
    return r;
  }
}
function lp(r) {
  for (const e in r)
    if (Object.prototype.hasOwnProperty.call(r, e))
      return !1;
  return !0;
}
function Yn(r, e) {
  if (r === e)
    return !0;
  const t = Object.keys(r), n = Object.keys(e);
  for (const s of t) {
    if (!n.includes(s))
      return !1;
    const i = r[s], o = e[s];
    if (Cc(i) && Cc(o)) {
      if (!Yn(i, o))
        return !1;
    } else if (i !== o)
      return !1;
  }
  for (const s of n)
    if (!t.includes(s))
      return !1;
  return !0;
}
function Cc(r) {
  return r !== null && typeof r == "object";
}
function zs(r) {
  const e = [];
  for (const [t, n] of Object.entries(r))
    Array.isArray(n) ? n.forEach((s) => {
      e.push(encodeURIComponent(t) + "=" + encodeURIComponent(s));
    }) : e.push(encodeURIComponent(t) + "=" + encodeURIComponent(n));
  return e.length ? "&" + e.join("&") : "";
}
function cs(r) {
  const e = {};
  return r.replace(/^\?/, "").split("&").forEach((n) => {
    if (n) {
      const [s, i] = n.split("=");
      e[decodeURIComponent(s)] = decodeURIComponent(i);
    }
  }), e;
}
function ls(r) {
  const e = r.indexOf("?");
  if (!e)
    return "";
  const t = r.indexOf("#", e);
  return r.substring(e, t > 0 ? t : void 0);
}
function hp(r, e) {
  const t = new Cp(r, e);
  return t.subscribe.bind(t);
}
class Cp {
  /**
   * @param executor Function which can make calls to a single Observer
   *     as a proxy.
   * @param onNoObservers Callback when count of Observers goes to zero.
   */
  constructor(e, t) {
    this.observers = [], this.unsubscribes = [], this.observerCount = 0, this.task = Promise.resolve(), this.finalized = !1, this.onNoObservers = t, this.task.then(() => {
      e(this);
    }).catch((n) => {
      this.error(n);
    });
  }
  next(e) {
    this.forEachObserver((t) => {
      t.next(e);
    });
  }
  error(e) {
    this.forEachObserver((t) => {
      t.error(e);
    }), this.close(e);
  }
  complete() {
    this.forEachObserver((e) => {
      e.complete();
    }), this.close();
  }
  /**
   * Subscribe function that can be used to add an Observer to the fan-out list.
   *
   * - We require that no event is sent to a subscriber synchronously to their
   *   call to subscribe().
   */
  subscribe(e, t, n) {
    let s;
    if (e === void 0 && t === void 0 && n === void 0)
      throw new Error("Missing Observer.");
    fp(e, [
      "next",
      "error",
      "complete"
    ]) ? s = e : s = {
      next: e,
      error: t,
      complete: n
    }, s.next === void 0 && (s.next = fa), s.error === void 0 && (s.error = fa), s.complete === void 0 && (s.complete = fa);
    const i = this.unsubscribeOne.bind(this, this.observers.length);
    return this.finalized && this.task.then(() => {
      try {
        this.finalError ? s.error(this.finalError) : s.complete();
      } catch {
      }
    }), this.observers.push(s), i;
  }
  // Unsubscribe is synchronous - we guarantee that no events are sent to
  // any unsubscribed Observer.
  unsubscribeOne(e) {
    this.observers === void 0 || this.observers[e] === void 0 || (delete this.observers[e], this.observerCount -= 1, this.observerCount === 0 && this.onNoObservers !== void 0 && this.onNoObservers(this));
  }
  forEachObserver(e) {
    if (!this.finalized)
      for (let t = 0; t < this.observers.length; t++)
        this.sendOne(t, e);
  }
  // Call the Observer via one of it's callback function. We are careful to
  // confirm that the observe has not been unsubscribed since this asynchronous
  // function had been queued.
  sendOne(e, t) {
    this.task.then(() => {
      if (this.observers !== void 0 && this.observers[e] !== void 0)
        try {
          t(this.observers[e]);
        } catch (n) {
          typeof console < "u" && console.error && console.error(n);
        }
    });
  }
  close(e) {
    this.finalized || (this.finalized = !0, e !== void 0 && (this.finalError = e), this.task.then(() => {
      this.observers = void 0, this.onNoObservers = void 0;
    }));
  }
}
function fp(r, e) {
  if (typeof r != "object" || r === null)
    return !1;
  for (const t of e)
    if (t in r && typeof r[t] == "function")
      return !0;
  return !1;
}
function fa() {
}
function Re(r) {
  return r && r._delegate ? r._delegate : r;
}
function Qs(r) {
  try {
    return (r.startsWith("http://") || r.startsWith("https://") ? new URL(r).hostname : r).endsWith(".cloudworkstations.dev");
  } catch {
    return !1;
  }
}
async function _h(r) {
  return (await fetch(r, {
    credentials: "include"
  })).ok;
}
class Xn {
  /**
   *
   * @param name The public service name, e.g. app, auth, firestore, database
   * @param instanceFactory Service factory responsible for creating the public interface
   * @param type whether the service provided by the component is public or private
   */
  constructor(e, t, n) {
    this.name = e, this.instanceFactory = t, this.type = n, this.multipleInstances = !1, this.serviceProps = {}, this.instantiationMode = "LAZY", this.onInstanceCreated = null;
  }
  setInstantiationMode(e) {
    return this.instantiationMode = e, this;
  }
  setMultipleInstances(e) {
    return this.multipleInstances = e, this;
  }
  setServiceProps(e) {
    return this.serviceProps = e, this;
  }
  setInstanceCreatedCallback(e) {
    return this.onInstanceCreated = e, this;
  }
}
const Jn = "[DEFAULT]";
class dp {
  constructor(e, t) {
    this.name = e, this.container = t, this.component = null, this.instances = /* @__PURE__ */ new Map(), this.instancesDeferred = /* @__PURE__ */ new Map(), this.instancesOptions = /* @__PURE__ */ new Map(), this.onInitCallbacks = /* @__PURE__ */ new Map();
  }
  /**
   * @param identifier A provider can provide multiple instances of a service
   * if this.component.multipleInstances is true.
   */
  get(e) {
    const t = this.normalizeInstanceIdentifier(e);
    if (!this.instancesDeferred.has(t)) {
      const n = new Eh();
      if (this.instancesDeferred.set(t, n), this.isInitialized(t) || this.shouldAutoInitialize())
        try {
          const s = this.getOrInitializeService({
            instanceIdentifier: t
          });
          s && n.resolve(s);
        } catch {
        }
    }
    return this.instancesDeferred.get(t).promise;
  }
  getImmediate(e) {
    const t = this.normalizeInstanceIdentifier(e?.identifier), n = e?.optional ?? !1;
    if (this.isInitialized(t) || this.shouldAutoInitialize())
      try {
        return this.getOrInitializeService({
          instanceIdentifier: t
        });
      } catch (s) {
        if (n)
          return null;
        throw s;
      }
    else {
      if (n)
        return null;
      throw Error(`Service ${this.name} is not available`);
    }
  }
  getComponent() {
    return this.component;
  }
  setComponent(e) {
    if (e.name !== this.name)
      throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);
    if (this.component)
      throw Error(`Component for ${this.name} has already been provided`);
    if (this.component = e, !!this.shouldAutoInitialize()) {
      if (gp(e))
        try {
          this.getOrInitializeService({ instanceIdentifier: Jn });
        } catch {
        }
      for (const [t, n] of this.instancesDeferred.entries()) {
        const s = this.normalizeInstanceIdentifier(t);
        try {
          const i = this.getOrInitializeService({
            instanceIdentifier: s
          });
          n.resolve(i);
        } catch {
        }
      }
    }
  }
  clearInstance(e = Jn) {
    this.instancesDeferred.delete(e), this.instancesOptions.delete(e), this.instances.delete(e);
  }
  // app.delete() will call this method on every provider to delete the services
  // TODO: should we mark the provider as deleted?
  async delete() {
    const e = Array.from(this.instances.values());
    await Promise.all([
      ...e.filter((t) => "INTERNAL" in t).map((t) => t.INTERNAL.delete()),
      ...e.filter((t) => "_delete" in t).map((t) => t._delete())
    ]);
  }
  isComponentSet() {
    return this.component != null;
  }
  isInitialized(e = Jn) {
    return this.instances.has(e);
  }
  getOptions(e = Jn) {
    return this.instancesOptions.get(e) || {};
  }
  initialize(e = {}) {
    const { options: t = {} } = e, n = this.normalizeInstanceIdentifier(e.instanceIdentifier);
    if (this.isInitialized(n))
      throw Error(`${this.name}(${n}) has already been initialized`);
    if (!this.isComponentSet())
      throw Error(`Component ${this.name} has not been registered yet`);
    const s = this.getOrInitializeService({
      instanceIdentifier: n,
      options: t
    });
    for (const [i, o] of this.instancesDeferred.entries()) {
      const B = this.normalizeInstanceIdentifier(i);
      n === B && o.resolve(s);
    }
    return s;
  }
  /**
   *
   * @param callback - a function that will be invoked  after the provider has been initialized by calling provider.initialize().
   * The function is invoked SYNCHRONOUSLY, so it should not execute any longrunning tasks in order to not block the program.
   *
   * @param identifier An optional instance identifier
   * @returns a function to unregister the callback
   */
  onInit(e, t) {
    const n = this.normalizeInstanceIdentifier(t), s = this.onInitCallbacks.get(n) ?? /* @__PURE__ */ new Set();
    s.add(e), this.onInitCallbacks.set(n, s);
    const i = this.instances.get(n);
    return i && e(i, n), () => {
      s.delete(e);
    };
  }
  /**
   * Invoke onInit callbacks synchronously
   * @param instance the service instance`
   */
  invokeOnInitCallbacks(e, t) {
    const n = this.onInitCallbacks.get(t);
    if (n)
      for (const s of n)
        try {
          s(e, t);
        } catch {
        }
  }
  getOrInitializeService({ instanceIdentifier: e, options: t = {} }) {
    let n = this.instances.get(e);
    if (!n && this.component && (n = this.component.instanceFactory(this.container, {
      instanceIdentifier: pp(e),
      options: t
    }), this.instances.set(e, n), this.instancesOptions.set(e, t), this.invokeOnInitCallbacks(n, e), this.component.onInstanceCreated))
      try {
        this.component.onInstanceCreated(this.container, e, n);
      } catch {
      }
    return n || null;
  }
  normalizeInstanceIdentifier(e = Jn) {
    return this.component ? this.component.multipleInstances ? e : Jn : e;
  }
  shouldAutoInitialize() {
    return !!this.component && this.component.instantiationMode !== "EXPLICIT";
  }
}
function pp(r) {
  return r === Jn ? void 0 : r;
}
function gp(r) {
  return r.instantiationMode === "EAGER";
}
class mp {
  constructor(e) {
    this.name = e, this.providers = /* @__PURE__ */ new Map();
  }
  /**
   *
   * @param component Component being added
   * @param overwrite When a component with the same name has already been registered,
   * if overwrite is true: overwrite the existing component with the new component and create a new
   * provider with the new component. It can be useful in tests where you want to use different mocks
   * for different tests.
   * if overwrite is false: throw an exception
   */
  addComponent(e) {
    const t = this.getProvider(e.name);
    if (t.isComponentSet())
      throw new Error(`Component ${e.name} has already been registered with ${this.name}`);
    t.setComponent(e);
  }
  addOrOverwriteComponent(e) {
    this.getProvider(e.name).isComponentSet() && this.providers.delete(e.name), this.addComponent(e);
  }
  /**
   * getProvider provides a type safe interface where it can only be called with a field name
   * present in NameServiceMapping interface.
   *
   * Firebase SDKs providing services should extend NameServiceMapping interface to register
   * themselves.
   */
  getProvider(e) {
    if (this.providers.has(e))
      return this.providers.get(e);
    const t = new dp(e, this);
    return this.providers.set(e, t), t;
  }
  getProviders() {
    return Array.from(this.providers.values());
  }
}
var ae;
(function(r) {
  r[r.DEBUG = 0] = "DEBUG", r[r.VERBOSE = 1] = "VERBOSE", r[r.INFO = 2] = "INFO", r[r.WARN = 3] = "WARN", r[r.ERROR = 4] = "ERROR", r[r.SILENT = 5] = "SILENT";
})(ae || (ae = {}));
const Ep = {
  debug: ae.DEBUG,
  verbose: ae.VERBOSE,
  info: ae.INFO,
  warn: ae.WARN,
  error: ae.ERROR,
  silent: ae.SILENT
}, _p = ae.INFO, Dp = {
  [ae.DEBUG]: "log",
  [ae.VERBOSE]: "log",
  [ae.INFO]: "info",
  [ae.WARN]: "warn",
  [ae.ERROR]: "error"
}, Ip = (r, e, ...t) => {
  if (e < r.logLevel)
    return;
  const n = (/* @__PURE__ */ new Date()).toISOString(), s = Dp[e];
  if (s)
    console[s](`[${n}]  ${r.name}:`, ...t);
  else
    throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`);
};
class iB {
  /**
   * Gives you an instance of a Logger to capture messages according to
   * Firebase's logging scheme.
   *
   * @param name The name that the logs will be associated with
   */
  constructor(e) {
    this.name = e, this._logLevel = _p, this._logHandler = Ip, this._userLogHandler = null;
  }
  get logLevel() {
    return this._logLevel;
  }
  set logLevel(e) {
    if (!(e in ae))
      throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);
    this._logLevel = e;
  }
  // Workaround for setter/getter having to be the same type.
  setLogLevel(e) {
    this._logLevel = typeof e == "string" ? Ep[e] : e;
  }
  get logHandler() {
    return this._logHandler;
  }
  set logHandler(e) {
    if (typeof e != "function")
      throw new TypeError("Value assigned to `logHandler` must be a function");
    this._logHandler = e;
  }
  get userLogHandler() {
    return this._userLogHandler;
  }
  set userLogHandler(e) {
    this._userLogHandler = e;
  }
  /**
   * The functions below are all based on the `console` interface
   */
  debug(...e) {
    this._userLogHandler && this._userLogHandler(this, ae.DEBUG, ...e), this._logHandler(this, ae.DEBUG, ...e);
  }
  log(...e) {
    this._userLogHandler && this._userLogHandler(this, ae.VERBOSE, ...e), this._logHandler(this, ae.VERBOSE, ...e);
  }
  info(...e) {
    this._userLogHandler && this._userLogHandler(this, ae.INFO, ...e), this._logHandler(this, ae.INFO, ...e);
  }
  warn(...e) {
    this._userLogHandler && this._userLogHandler(this, ae.WARN, ...e), this._logHandler(this, ae.WARN, ...e);
  }
  error(...e) {
    this._userLogHandler && this._userLogHandler(this, ae.ERROR, ...e), this._logHandler(this, ae.ERROR, ...e);
  }
}
const wp = (r, e) => e.some((t) => r instanceof t);
let fc, dc;
function yp() {
  return fc || (fc = [
    IDBDatabase,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBTransaction
  ]);
}
function Tp() {
  return dc || (dc = [
    IDBCursor.prototype.advance,
    IDBCursor.prototype.continue,
    IDBCursor.prototype.continuePrimaryKey
  ]);
}
const Dh = /* @__PURE__ */ new WeakMap(), Oa = /* @__PURE__ */ new WeakMap(), Ih = /* @__PURE__ */ new WeakMap(), da = /* @__PURE__ */ new WeakMap(), oB = /* @__PURE__ */ new WeakMap();
function Ap(r) {
  const e = new Promise((t, n) => {
    const s = () => {
      r.removeEventListener("success", i), r.removeEventListener("error", o);
    }, i = () => {
      t(dn(r.result)), s();
    }, o = () => {
      n(r.error), s();
    };
    r.addEventListener("success", i), r.addEventListener("error", o);
  });
  return e.then((t) => {
    t instanceof IDBCursor && Dh.set(t, r);
  }).catch(() => {
  }), oB.set(e, r), e;
}
function Rp(r) {
  if (Oa.has(r))
    return;
  const e = new Promise((t, n) => {
    const s = () => {
      r.removeEventListener("complete", i), r.removeEventListener("error", o), r.removeEventListener("abort", o);
    }, i = () => {
      t(), s();
    }, o = () => {
      n(r.error || new DOMException("AbortError", "AbortError")), s();
    };
    r.addEventListener("complete", i), r.addEventListener("error", o), r.addEventListener("abort", o);
  });
  Oa.set(r, e);
}
let ba = {
  get(r, e, t) {
    if (r instanceof IDBTransaction) {
      if (e === "done")
        return Oa.get(r);
      if (e === "objectStoreNames")
        return r.objectStoreNames || Ih.get(r);
      if (e === "store")
        return t.objectStoreNames[1] ? void 0 : t.objectStore(t.objectStoreNames[0]);
    }
    return dn(r[e]);
  },
  set(r, e, t) {
    return r[e] = t, !0;
  },
  has(r, e) {
    return r instanceof IDBTransaction && (e === "done" || e === "store") ? !0 : e in r;
  }
};
function vp(r) {
  ba = r(ba);
}
function Pp(r) {
  return r === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype) ? function(e, ...t) {
    const n = r.call(pa(this), e, ...t);
    return Ih.set(n, e.sort ? e.sort() : [e]), dn(n);
  } : Tp().includes(r) ? function(...e) {
    return r.apply(pa(this), e), dn(Dh.get(this));
  } : function(...e) {
    return dn(r.apply(pa(this), e));
  };
}
function Sp(r) {
  return typeof r == "function" ? Pp(r) : (r instanceof IDBTransaction && Rp(r), wp(r, yp()) ? new Proxy(r, ba) : r);
}
function dn(r) {
  if (r instanceof IDBRequest)
    return Ap(r);
  if (da.has(r))
    return da.get(r);
  const e = Sp(r);
  return e !== r && (da.set(r, e), oB.set(e, r)), e;
}
const pa = (r) => oB.get(r);
function Op(r, e, { blocked: t, upgrade: n, blocking: s, terminated: i } = {}) {
  const o = indexedDB.open(r, e), B = dn(o);
  return n && o.addEventListener("upgradeneeded", (u) => {
    n(dn(o.result), u.oldVersion, u.newVersion, dn(o.transaction), u);
  }), t && o.addEventListener("blocked", (u) => t(
    // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
    u.oldVersion,
    u.newVersion,
    u
  )), B.then((u) => {
    i && u.addEventListener("close", () => i()), s && u.addEventListener("versionchange", (c) => s(c.oldVersion, c.newVersion, c));
  }).catch(() => {
  }), B;
}
const bp = ["get", "getKey", "getAll", "getAllKeys", "count"], Np = ["put", "add", "delete", "clear"], ga = /* @__PURE__ */ new Map();
function pc(r, e) {
  if (!(r instanceof IDBDatabase && !(e in r) && typeof e == "string"))
    return;
  if (ga.get(e))
    return ga.get(e);
  const t = e.replace(/FromIndex$/, ""), n = e !== t, s = Np.includes(t);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(t in (n ? IDBIndex : IDBObjectStore).prototype) || !(s || bp.includes(t))
  )
    return;
  const i = async function(o, ...B) {
    const u = this.transaction(o, s ? "readwrite" : "readonly");
    let c = u.store;
    return n && (c = c.index(B.shift())), (await Promise.all([
      c[t](...B),
      s && u.done
    ]))[0];
  };
  return ga.set(e, i), i;
}
vp((r) => ({
  ...r,
  get: (e, t, n) => pc(e, t) || r.get(e, t, n),
  has: (e, t) => !!pc(e, t) || r.has(e, t)
}));
class Fp {
  constructor(e) {
    this.container = e;
  }
  // In initial implementation, this will be called by installations on
  // auth token refresh, and installations will send this string.
  getPlatformInfoString() {
    return this.container.getProviders().map((t) => {
      if (Lp(t)) {
        const n = t.getImmediate();
        return `${n.library}/${n.version}`;
      } else
        return null;
    }).filter((t) => t).join(" ");
  }
}
function Lp(r) {
  return r.getComponent()?.type === "VERSION";
}
const Na = "@firebase/app", gc = "0.16.1";
const Kt = new iB("@firebase/app"), kp = "@firebase/app-compat", Vp = "@firebase/analytics-compat", xp = "@firebase/analytics", Mp = "@firebase/app-check-compat", Gp = "@firebase/app-check", Hp = "@firebase/auth", Up = "@firebase/auth-compat", Jp = "@firebase/database", jp = "@firebase/data-connect", qp = "@firebase/database-compat", Kp = "@firebase/functions", zp = "@firebase/functions-compat", Qp = "@firebase/installations", Wp = "@firebase/installations-compat", $p = "@firebase/messaging", Yp = "@firebase/messaging-compat", Xp = "@firebase/performance", Zp = "@firebase/performance-compat", eg = "@firebase/remote-config", tg = "@firebase/remote-config-compat", ng = "@firebase/storage", rg = "@firebase/storage-compat", sg = "@firebase/firestore", ig = "@firebase/ai", og = "@firebase/firestore-compat", ag = "firebase", Bg = "12.18.0";
const Fa = "[DEFAULT]", ug = {
  [Na]: "fire-core",
  [kp]: "fire-core-compat",
  [xp]: "fire-analytics",
  [Vp]: "fire-analytics-compat",
  [Gp]: "fire-app-check",
  [Mp]: "fire-app-check-compat",
  [Hp]: "fire-auth",
  [Up]: "fire-auth-compat",
  [Jp]: "fire-rtdb",
  [jp]: "fire-data-connect",
  [qp]: "fire-rtdb-compat",
  [Kp]: "fire-fn",
  [zp]: "fire-fn-compat",
  [Qp]: "fire-iid",
  [Wp]: "fire-iid-compat",
  [$p]: "fire-fcm",
  [Yp]: "fire-fcm-compat",
  [Xp]: "fire-perf",
  [Zp]: "fire-perf-compat",
  [eg]: "fire-rc",
  [tg]: "fire-rc-compat",
  [ng]: "fire-gcs",
  [rg]: "fire-gcs-compat",
  [sg]: "fire-fst",
  [og]: "fire-fst-compat",
  [ig]: "fire-vertex",
  "fire-js": "fire-js",
  // Platform identifier for JS SDK.
  [ag]: "fire-js-all"
};
const Ts = /* @__PURE__ */ new Map(), cg = /* @__PURE__ */ new Map(), La = /* @__PURE__ */ new Map();
function mc(r, e) {
  try {
    r.container.addComponent(e);
  } catch (t) {
    Kt.debug(`Component ${e.name} failed to register with FirebaseApp ${r.name}`, t);
  }
}
function Tr(r) {
  const e = r.name;
  if (La.has(e))
    return Kt.debug(`There were multiple attempts to register component ${e}.`), !1;
  La.set(e, r);
  for (const t of Ts.values())
    mc(t, r);
  for (const t of cg.values())
    mc(t, r);
  return !0;
}
function aB(r, e) {
  const t = r.container.getProvider("heartbeat").getImmediate({ optional: !0 });
  return t && t.triggerHeartbeat(), r.container.getProvider(e);
}
function It(r) {
  return r == null ? !1 : r.settings !== void 0;
}
const lg = {
  "no-app": "No Firebase App '{$appName}' has been created - call initializeApp() first",
  "bad-app-name": "Illegal App name: '{$appName}'",
  "duplicate-app": "Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.",
  "app-deleted": "Firebase App named '{$appName}' already deleted",
  "server-app-deleted": "Firebase Server App has been deleted",
  "no-options": "Need to provide options, when not being deployed to hosting via source.",
  "invalid-app-argument": "firebase.{$appName}() takes either no argument or a Firebase App instance.",
  "invalid-log-argument": "First argument to `onLog` must be null or a function.",
  "idb-open": "Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.",
  "idb-get": "Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.",
  "idb-set": "Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.",
  "idb-delete": "Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.",
  "finalization-registry-not-supported": "FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.",
  "invalid-server-app-environment": "FirebaseServerApp is not for use in browser environments."
}, Gt = new Ks("app", "Firebase", lg);
class hg {
  constructor(e, t, n) {
    this._isDeleted = !1, this._options = { ...e }, this._config = { ...t }, this._name = t.name, this._automaticDataCollectionEnabled = t.automaticDataCollectionEnabled, this._container = n, this.container.addComponent(new Xn(
      "app",
      () => this,
      "PUBLIC"
      /* ComponentType.PUBLIC */
    ));
  }
  get automaticDataCollectionEnabled() {
    return this.checkDestroyed(), this._automaticDataCollectionEnabled;
  }
  set automaticDataCollectionEnabled(e) {
    this.checkDestroyed(), this._automaticDataCollectionEnabled = e;
  }
  get name() {
    return this.checkDestroyed(), this._name;
  }
  get options() {
    return this.checkDestroyed(), this._options;
  }
  get config() {
    return this.checkDestroyed(), this._config;
  }
  get container() {
    return this._container;
  }
  get isDeleted() {
    return this._isDeleted;
  }
  set isDeleted(e) {
    this._isDeleted = e;
  }
  /**
   * This function will throw an Error if the App has already been deleted -
   * use before performing API actions on the App.
   */
  checkDestroyed() {
    if (this.isDeleted)
      throw Gt.create("app-deleted", { appName: this._name });
  }
}
const Lr = Bg;
function Cg(r, e = {}) {
  let t = r;
  typeof e != "object" && (e = { name: e });
  const n = {
    name: Fa,
    automaticDataCollectionEnabled: !0,
    ...e
  }, s = n.name;
  if (typeof s != "string" || !s)
    throw Gt.create("bad-app-name", {
      appName: String(s)
    });
  if (t || (t = gh()), !t)
    throw Gt.create(
      "no-options"
      /* AppError.NO_OPTIONS */
    );
  const i = Ts.get(s);
  if (i)
    if (Yn(t, i.options)) {
      if (Yn(n, i.config))
        return i;
      throw Gt.create("duplicate-app", {
        appName: s,
        mismatchedParam: "config",
        oldValue: JSON.stringify(i.config),
        newValue: JSON.stringify(n)
      });
    } else throw Gt.create("duplicate-app", {
      appName: s,
      mismatchedParam: "options",
      oldValue: JSON.stringify(i.options),
      newValue: JSON.stringify(t)
    });
  const o = new mp(s);
  for (const u of La.values())
    o.addComponent(u);
  const B = new hg(t, n, o);
  return Ts.set(s, B), B;
}
function wh(r = Fa) {
  const e = Ts.get(r);
  if (!e && r === Fa && gh())
    return Cg();
  if (!e)
    throw Gt.create("no-app", { appName: r });
  return e;
}
function uT() {
  return Array.from(Ts.values());
}
function pn(r, e, t) {
  let n = ug[r] ?? r;
  t && (n += `-${t}`);
  const s = n.match(/\s|\//), i = e.match(/\s|\//);
  if (s || i) {
    const o = [
      `Unable to register library "${n}" with version "${e}":`
    ];
    s && o.push(`library name "${n}" contains illegal characters (whitespace or "/")`), s && i && o.push("and"), i && o.push(`version name "${e}" contains illegal characters (whitespace or "/")`), Kt.warn(o.join(" "));
    return;
  }
  Tr(new Xn(
    `${n}-version`,
    () => ({ library: n, version: e }),
    "VERSION"
    /* ComponentType.VERSION */
  ));
}
const fg = "firebase-heartbeat-database", dg = 1, As = "firebase-heartbeat-store";
let ma = null;
function yh() {
  return ma || (ma = Op(fg, dg, {
    upgrade: (r, e) => {
      switch (e) {
        case 0:
          try {
            r.createObjectStore(As);
          } catch (t) {
            console.warn(t);
          }
      }
    }
  }).catch((r) => {
    throw Gt.create("idb-open", {
      originalErrorMessage: r.message
    });
  })), ma;
}
async function pg(r) {
  try {
    const t = (await yh()).transaction(As), n = await t.objectStore(As).get(Th(r));
    return await t.done, n;
  } catch (e) {
    if (e instanceof $t)
      Kt.warn(e.message);
    else {
      const t = Gt.create("idb-get", {
        originalErrorMessage: e?.message
      });
      Kt.warn(t.message);
    }
  }
}
async function Ec(r, e) {
  try {
    const n = (await yh()).transaction(As, "readwrite");
    await n.objectStore(As).put(e, Th(r)), await n.done;
  } catch (t) {
    if (t instanceof $t)
      Kt.warn(t.message);
    else {
      const n = Gt.create("idb-set", {
        originalErrorMessage: t?.message
      });
      Kt.warn(n.message);
    }
  }
}
function Th(r) {
  return `${r.name}!${r.options.appId}`;
}
const gg = 1024, mg = 30;
class Eg {
  constructor(e) {
    this.container = e, this._heartbeatsCache = null;
    const t = this.container.getProvider("app").getImmediate();
    this._storage = new Dg(t), this._heartbeatsCachePromise = this._storage.read().then((n) => (this._heartbeatsCache = n, n));
  }
  /**
   * Called to report a heartbeat. The function will generate
   * a HeartbeatsByUserAgent object, update heartbeatsCache, and persist it
   * to IndexedDB.
   * Note that we only store one heartbeat per day. So if a heartbeat for today is
   * already logged, subsequent calls to this function in the same day will be ignored.
   */
  async triggerHeartbeat() {
    try {
      const t = this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(), n = _c();
      if (this._heartbeatsCache?.heartbeats == null && (this._heartbeatsCache = await this._heartbeatsCachePromise, this._heartbeatsCache?.heartbeats == null) || this._heartbeatsCache.lastSentHeartbeatDate === n || this._heartbeatsCache.heartbeats.some((s) => s.date === n))
        return;
      if (this._heartbeatsCache.heartbeats.push({ date: n, agent: t }), this._heartbeatsCache.heartbeats.length > mg) {
        const s = Ig(this._heartbeatsCache.heartbeats);
        this._heartbeatsCache.heartbeats.splice(s, 1);
      }
      return this._storage.overwrite(this._heartbeatsCache);
    } catch (e) {
      Kt.warn(e);
    }
  }
  /**
   * Returns a base64 encoded string which can be attached to the heartbeat-specific header directly.
   * It also clears all heartbeats from memory as well as in IndexedDB.
   *
   * NOTE: Consuming product SDKs should not send the header if this method
   * returns an empty string.
   */
  async getHeartbeatsHeader() {
    try {
      if (this._heartbeatsCache === null && await this._heartbeatsCachePromise, this._heartbeatsCache?.heartbeats == null || this._heartbeatsCache.heartbeats.length === 0)
        return "";
      const e = _c(), { heartbeatsToSend: t, unsentEntries: n } = _g(this._heartbeatsCache.heartbeats), s = Wi(JSON.stringify({ version: 2, heartbeats: t }));
      return this._heartbeatsCache.lastSentHeartbeatDate = e, n.length > 0 ? (this._heartbeatsCache.heartbeats = n, await this._storage.overwrite(this._heartbeatsCache)) : (this._heartbeatsCache.heartbeats = [], this._storage.overwrite(this._heartbeatsCache)), s;
    } catch (e) {
      return Kt.warn(e), "";
    }
  }
}
function _c() {
  return (/* @__PURE__ */ new Date()).toISOString().substring(0, 10);
}
function _g(r, e = gg) {
  const t = [];
  let n = r.slice();
  for (const s of r) {
    const i = t.find((o) => o.agent === s.agent);
    if (i) {
      if (i.dates.push(s.date), Dc(t) > e) {
        i.dates.pop();
        break;
      }
    } else if (t.push({
      agent: s.agent,
      dates: [s.date]
    }), Dc(t) > e) {
      t.pop();
      break;
    }
    n = n.slice(1);
  }
  return {
    heartbeatsToSend: t,
    unsentEntries: n
  };
}
class Dg {
  constructor(e) {
    this.app = e, this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
  }
  async runIndexedDBEnvironmentCheck() {
    return ap() ? Bp().then(() => !0).catch(() => !1) : !1;
  }
  /**
   * Read all heartbeats.
   */
  async read() {
    if (await this._canUseIndexedDBPromise) {
      const t = await pg(this.app);
      return t?.heartbeats ? t : { heartbeats: [] };
    } else
      return { heartbeats: [] };
  }
  // overwrite the storage with the provided heartbeats
  async overwrite(e) {
    if (await this._canUseIndexedDBPromise) {
      const n = await this.read();
      return Ec(this.app, {
        lastSentHeartbeatDate: e.lastSentHeartbeatDate ?? n.lastSentHeartbeatDate,
        heartbeats: e.heartbeats
      });
    } else
      return;
  }
  // add heartbeats
  async add(e) {
    if (await this._canUseIndexedDBPromise) {
      const n = await this.read();
      return Ec(this.app, {
        lastSentHeartbeatDate: e.lastSentHeartbeatDate ?? n.lastSentHeartbeatDate,
        heartbeats: [
          ...n.heartbeats,
          ...e.heartbeats
        ]
      });
    } else
      return;
  }
}
function Dc(r) {
  return Wi(
    // heartbeatsCache wrapper properties
    JSON.stringify({ version: 2, heartbeats: r })
  ).length;
}
function Ig(r) {
  if (r.length === 0)
    return -1;
  let e = 0, t = r[0].date;
  for (let n = 1; n < r.length; n++)
    r[n].date < t && (t = r[n].date, e = n);
  return e;
}
function wg(r) {
  Tr(new Xn(
    "platform-logger",
    (e) => new Fp(e),
    "PRIVATE"
    /* ComponentType.PRIVATE */
  )), Tr(new Xn(
    "heartbeat",
    (e) => new Eg(e),
    "PRIVATE"
    /* ComponentType.PRIVATE */
  )), pn(Na, gc, r), pn(Na, gc, "esm2020"), pn("fire-js", "");
}
wg("");
var yg = "firebase", Tg = "12.18.0";
pn(yg, Tg, "app");
function Ah() {
  return {
    "dependent-sdk-initialized-before-auth": "Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."
  };
}
const Ag = Ah, Rh = new Ks("auth", "Firebase", Ah());
const $i = new iB("@firebase/auth");
function vh(r, ...e) {
  $i.logLevel <= ae.WARN && $i.warn(`Auth (${Lr}): ${r}`, ...e);
}
function Mi(r, ...e) {
  $i.logLevel <= ae.ERROR && $i.error(`Auth (${Lr}): ${r}`, ...e);
}
function yt(r, ...e) {
  throw BB(r, ...e);
}
function bt(r, ...e) {
  return BB(r, ...e);
}
function Ph(r, e, t) {
  const n = {
    ...Ag(),
    [e]: t
  };
  return new Ks("auth", "Firebase", n).create(e, {
    appName: r.name
  });
}
function gn(r) {
  return Ph(r, "operation-not-supported-in-this-environment", "Operations that alter the current user are not supported in conjunction with FirebaseServerApp");
}
function BB(r, ...e) {
  if (typeof r != "string") {
    const t = e[0], n = [...e.slice(1)];
    return n[0] && (n[0].appName = r.name), r._errorFactory.create(t, ...n);
  }
  return Rh.create(r, ...e);
}
function te(r, e, ...t) {
  if (!r)
    throw BB(e, ...t);
}
function Ht(r) {
  const e = "INTERNAL ASSERTION FAILED: " + r;
  throw Mi(e), new Error(e);
}
function zt(r, e) {
  r || Ht(e);
}
function ka() {
  return typeof self < "u" && self.location?.href || "";
}
function Rg() {
  return Ic() === "http:" || Ic() === "https:";
}
function Ic() {
  return typeof self < "u" && self.location?.protocol || null;
}
function vg() {
  return typeof navigator < "u" && navigator && "onLine" in navigator && typeof navigator.onLine == "boolean" && // Apply only for traditional web apps and Chrome extensions.
  // This is especially true for Cordova apps which have unreliable
  // navigator.onLine behavior unless cordova-plugin-network-information is
  // installed which overwrites the native navigator.onLine value and
  // defines navigator.connection.
  (Rg() || rp() || "connection" in navigator) ? navigator.onLine : !0;
}
function Pg() {
  if (typeof navigator > "u")
    return null;
  const r = navigator;
  return (
    // Most reliable, but only supported in Chrome/Firefox.
    r.languages && r.languages[0] || // Supported in most browsers, but returns the language of the browser
    // UI, not the language set in browser settings.
    r.language || // Couldn't determine language.
    null
  );
}
class Ws {
  constructor(e, t) {
    this.shortDelay = e, this.longDelay = t, zt(t > e, "Short delay should be less than long delay!"), this.isMobile = ep() || sp();
  }
  get() {
    return vg() ? this.isMobile ? this.longDelay : this.shortDelay : Math.min(5e3, this.shortDelay);
  }
}
function uB(r, e) {
  zt(r.emulator, "Emulator should always be set here");
  const { url: t } = r.emulator;
  return e ? `${t}${e.startsWith("/") ? e.slice(1) : e}` : t;
}
class Sh {
  static initialize(e, t, n) {
    this.fetchImpl = e, t && (this.headersImpl = t), n && (this.responseImpl = n);
  }
  static fetch() {
    if (this.fetchImpl)
      return this.fetchImpl;
    if (typeof self < "u" && "fetch" in self)
      return self.fetch;
    if (typeof globalThis < "u" && globalThis.fetch)
      return globalThis.fetch;
    if (typeof fetch < "u")
      return fetch;
    Ht("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
  }
  static headers() {
    if (this.headersImpl)
      return this.headersImpl;
    if (typeof self < "u" && "Headers" in self)
      return self.Headers;
    if (typeof globalThis < "u" && globalThis.Headers)
      return globalThis.Headers;
    if (typeof Headers < "u")
      return Headers;
    Ht("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
  }
  static response() {
    if (this.responseImpl)
      return this.responseImpl;
    if (typeof self < "u" && "Response" in self)
      return self.Response;
    if (typeof globalThis < "u" && globalThis.Response)
      return globalThis.Response;
    if (typeof Response < "u")
      return Response;
    Ht("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
  }
}
const Sg = {
  // Custom token errors.
  CREDENTIAL_MISMATCH: "custom-token-mismatch",
  // This can only happen if the SDK sends a bad request.
  MISSING_CUSTOM_TOKEN: "internal-error",
  // Create Auth URI errors.
  INVALID_IDENTIFIER: "invalid-email",
  // This can only happen if the SDK sends a bad request.
  MISSING_CONTINUE_URI: "internal-error",
  // Sign in with email and password errors (some apply to sign up too).
  INVALID_PASSWORD: "wrong-password",
  // This can only happen if the SDK sends a bad request.
  MISSING_PASSWORD: "missing-password",
  // Thrown if Email Enumeration Protection is enabled in the project and the email or password is
  // invalid.
  INVALID_LOGIN_CREDENTIALS: "invalid-credential",
  // Sign up with email and password errors.
  EMAIL_EXISTS: "email-already-in-use",
  PASSWORD_LOGIN_DISABLED: "operation-not-allowed",
  // Verify assertion for sign in with credential errors:
  INVALID_IDP_RESPONSE: "invalid-credential",
  INVALID_PENDING_TOKEN: "invalid-credential",
  FEDERATED_USER_ID_ALREADY_LINKED: "credential-already-in-use",
  // This can only happen if the SDK sends a bad request.
  MISSING_REQ_TYPE: "internal-error",
  // Send Password reset email errors:
  EMAIL_NOT_FOUND: "user-not-found",
  RESET_PASSWORD_EXCEED_LIMIT: "too-many-requests",
  EXPIRED_OOB_CODE: "expired-action-code",
  INVALID_OOB_CODE: "invalid-action-code",
  // This can only happen if the SDK sends a bad request.
  MISSING_OOB_CODE: "internal-error",
  // Operations that require ID token in request:
  CREDENTIAL_TOO_OLD_LOGIN_AGAIN: "requires-recent-login",
  INVALID_ID_TOKEN: "invalid-user-token",
  TOKEN_EXPIRED: "user-token-expired",
  USER_NOT_FOUND: "user-token-expired",
  // Other errors.
  TOO_MANY_ATTEMPTS_TRY_LATER: "too-many-requests",
  PASSWORD_DOES_NOT_MEET_REQUIREMENTS: "password-does-not-meet-requirements",
  // Phone Auth related errors.
  INVALID_CODE: "invalid-verification-code",
  INVALID_SESSION_INFO: "invalid-verification-id",
  INVALID_TEMPORARY_PROOF: "invalid-credential",
  MISSING_SESSION_INFO: "missing-verification-id",
  SESSION_EXPIRED: "code-expired",
  // Other action code errors when additional settings passed.
  // MISSING_CONTINUE_URI is getting mapped to INTERNAL_ERROR above.
  // This is OK as this error will be caught by client side validation.
  MISSING_ANDROID_PACKAGE_NAME: "missing-android-pkg-name",
  UNAUTHORIZED_DOMAIN: "unauthorized-continue-uri",
  // getProjectConfig errors when clientId is passed.
  INVALID_OAUTH_CLIENT_ID: "invalid-oauth-client-id",
  // User actions (sign-up or deletion) disabled errors.
  ADMIN_ONLY_OPERATION: "admin-restricted-operation",
  // Multi factor related errors.
  INVALID_MFA_PENDING_CREDENTIAL: "invalid-multi-factor-session",
  MFA_ENROLLMENT_NOT_FOUND: "multi-factor-info-not-found",
  MISSING_MFA_ENROLLMENT_ID: "missing-multi-factor-info",
  MISSING_MFA_PENDING_CREDENTIAL: "missing-multi-factor-session",
  SECOND_FACTOR_EXISTS: "second-factor-already-in-use",
  SECOND_FACTOR_LIMIT_EXCEEDED: "maximum-second-factor-count-exceeded",
  // Blocking functions related errors.
  BLOCKING_FUNCTION_ERROR_RESPONSE: "internal-error",
  // Recaptcha related errors.
  RECAPTCHA_NOT_ENABLED: "recaptcha-not-enabled",
  MISSING_RECAPTCHA_TOKEN: "missing-recaptcha-token",
  INVALID_RECAPTCHA_TOKEN: "invalid-recaptcha-token",
  INVALID_RECAPTCHA_ACTION: "invalid-recaptcha-action",
  MISSING_CLIENT_TYPE: "missing-client-type",
  MISSING_RECAPTCHA_VERSION: "missing-recaptcha-version",
  INVALID_RECAPTCHA_VERSION: "invalid-recaptcha-version",
  INVALID_REQ_TYPE: "invalid-req-type"
  /* AuthErrorCode.INVALID_REQ_TYPE */
};
const Og = [
  "/v1/accounts:signInWithCustomToken",
  "/v1/accounts:signInWithEmailLink",
  "/v1/accounts:signInWithIdp",
  "/v1/accounts:signInWithPassword",
  "/v1/accounts:signInWithPhoneNumber",
  "/v1/token"
  /* Endpoint.TOKEN */
], bg = new Ws(3e4, 6e4);
function rr(r, e) {
  return r.tenantId && !e.tenantId ? {
    ...e,
    tenantId: r.tenantId
  } : e;
}
async function Fn(r, e, t, n, s = {}) {
  return Oh(r, s, async () => {
    let i = {}, o = {};
    n && (e === "GET" ? o = n : i = {
      body: JSON.stringify(n)
    });
    const B = zs({
      ...o,
      key: r.config.apiKey
    }).slice(1), u = await r._getAdditionalHeaders();
    u[
      "Content-Type"
      /* HttpHeader.CONTENT_TYPE */
    ] = "application/json", r.languageCode && (u[
      "X-Firebase-Locale"
      /* HttpHeader.X_FIREBASE_LOCALE */
    ] = r.languageCode);
    const c = {
      method: e,
      headers: u,
      ...i
    };
    return np() || (c.referrerPolicy = "strict-origin-when-cross-origin"), r.emulatorConfig && Qs(r.emulatorConfig.host) && (c.credentials = "include"), Sh.fetch()(await bh(r, r.config.apiHost, t, B), c);
  });
}
async function Oh(r, e, t) {
  r._canInitEmulator = !1;
  const n = { ...Sg, ...e };
  try {
    const s = new Fg(r), i = await Promise.race([
      t(),
      s.promise
    ]);
    s.clearNetworkTimeout();
    const o = await i.json();
    if ("needConfirmation" in o)
      throw Ri(r, "account-exists-with-different-credential", o);
    if (i.ok && !("errorMessage" in o))
      return o;
    {
      const B = i.ok ? o.errorMessage : o.error.message, [u, c] = B.split(" : ");
      if (u === "FEDERATED_USER_ID_ALREADY_LINKED")
        throw Ri(r, "credential-already-in-use", o);
      if (u === "EMAIL_EXISTS")
        throw Ri(r, "email-already-in-use", o);
      if (u === "USER_DISABLED")
        throw Ri(r, "user-disabled", o);
      const C = n[u] || u.toLowerCase().replace(/[_\s]+/g, "-");
      if (c)
        throw Ph(r, C, c);
      yt(r, C);
    }
  } catch (s) {
    if (s instanceof $t)
      throw s;
    yt(r, "network-request-failed", { message: String(s) });
  }
}
async function _o(r, e, t, n, s = {}) {
  const i = await Fn(r, e, t, n, s);
  return "mfaPendingCredential" in i && yt(r, "multi-factor-auth-required", {
    _serverResponse: i
  }), i;
}
async function bh(r, e, t, n) {
  const s = `${e}${t}?${n}`, i = r, o = i.config.emulator ? uB(r.config, s) : `${r.config.apiScheme}://${s}`;
  return Og.includes(t) && (await i._persistenceManagerAvailable, i._getPersistenceType() === "COOKIE") ? i._getPersistence()._getFinalTarget(o).toString() : o;
}
function Ng(r) {
  switch (r) {
    case "ENFORCE":
      return "ENFORCE";
    case "AUDIT":
      return "AUDIT";
    case "OFF":
      return "OFF";
    default:
      return "ENFORCEMENT_STATE_UNSPECIFIED";
  }
}
class Fg {
  clearNetworkTimeout() {
    clearTimeout(this.timer);
  }
  constructor(e) {
    this.auth = e, this.timer = null, this.promise = new Promise((t, n) => {
      this.timer = setTimeout(() => n(bt(
        this.auth,
        "network-request-failed"
        /* AuthErrorCode.NETWORK_REQUEST_FAILED */
      )), bg.get());
    });
  }
}
function Ri(r, e, t) {
  const n = {
    appName: r.name
  };
  t.email && (n.email = t.email), t.phoneNumber && (n.phoneNumber = t.phoneNumber);
  const s = bt(r, e, n);
  return s.customData._tokenResponse = t, s;
}
function wc(r) {
  return r !== void 0 && r.enterprise !== void 0;
}
class Lg {
  constructor(e) {
    if (this.siteKey = "", this.recaptchaEnforcementState = [], e.recaptchaKey === void 0)
      throw new Error("recaptchaKey undefined");
    this.siteKey = e.recaptchaKey.split("/")[3], this.recaptchaEnforcementState = e.recaptchaEnforcementState;
  }
  /**
   * Returns the reCAPTCHA Enterprise enforcement state for the given provider.
   *
   * @param providerStr - The provider whose enforcement state is to be returned.
   * @returns The reCAPTCHA Enterprise enforcement state for the given provider.
   */
  getProviderEnforcementState(e) {
    if (!this.recaptchaEnforcementState || this.recaptchaEnforcementState.length === 0)
      return null;
    for (const t of this.recaptchaEnforcementState)
      if (t.provider && t.provider === e)
        return Ng(t.enforcementState);
    return null;
  }
  /**
   * Returns true if the reCAPTCHA Enterprise enforcement state for the provider is set to ENFORCE or AUDIT.
   *
   * @param providerStr - The provider whose enablement state is to be returned.
   * @returns Whether or not reCAPTCHA Enterprise protection is enabled for the given provider.
   */
  isProviderEnabled(e) {
    return this.getProviderEnforcementState(e) === "ENFORCE" || this.getProviderEnforcementState(e) === "AUDIT";
  }
  /**
   * Returns true if reCAPTCHA Enterprise protection is enabled in at least one provider, otherwise
   * returns false.
   *
   * @returns Whether or not reCAPTCHA Enterprise protection is enabled for at least one provider.
   */
  isAnyProviderEnabled() {
    return this.isProviderEnabled(
      "EMAIL_PASSWORD_PROVIDER"
      /* RecaptchaAuthProvider.EMAIL_PASSWORD_PROVIDER */
    ) || this.isProviderEnabled(
      "PHONE_PROVIDER"
      /* RecaptchaAuthProvider.PHONE_PROVIDER */
    );
  }
}
async function kg(r, e) {
  return Fn(r, "GET", "/v2/recaptchaConfig", rr(r, e));
}
async function Vg(r, e) {
  return Fn(r, "POST", "/v1/accounts:delete", e);
}
async function Yi(r, e) {
  return Fn(r, "POST", "/v1/accounts:lookup", e);
}
function ps(r) {
  if (r)
    try {
      const e = new Date(Number(r));
      if (!isNaN(e.getTime()))
        return e.toUTCString();
    } catch {
    }
}
async function xg(r, e = !1) {
  const t = Re(r), n = await t.getIdToken(e), s = cB(n);
  te(
    s && s.exp && s.auth_time && s.iat,
    t.auth,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  );
  const i = typeof s.firebase == "object" ? s.firebase : void 0, o = i?.sign_in_provider;
  return {
    claims: s,
    token: n,
    authTime: ps(Ea(s.auth_time)),
    issuedAtTime: ps(Ea(s.iat)),
    expirationTime: ps(Ea(s.exp)),
    signInProvider: o || null,
    signInSecondFactor: i?.sign_in_second_factor || null
  };
}
function Ea(r) {
  return Number(r) * 1e3;
}
function cB(r) {
  const [e, t, n] = r.split(".");
  if (e === void 0 || t === void 0 || n === void 0)
    return Mi("JWT malformed, contained fewer than 3 sections"), null;
  try {
    const s = dh(t);
    return s ? JSON.parse(s) : (Mi("Failed to decode base64 JWT payload"), null);
  } catch (s) {
    return Mi("Caught error parsing JWT payload as JSON", s?.toString()), null;
  }
}
function yc(r) {
  const e = cB(r);
  return te(
    e,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), te(
    typeof e.exp < "u",
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), te(
    typeof e.iat < "u",
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), Number(e.exp) - Number(e.iat);
}
async function Rs(r, e, t = !1) {
  if (t)
    return e;
  try {
    return await e;
  } catch (n) {
    throw n instanceof $t && Mg(n) && r.auth.currentUser === r && await r.auth.signOut(), n;
  }
}
function Mg({ code: r }) {
  return r === "auth/user-disabled" || r === "auth/user-token-expired";
}
class Gg {
  constructor(e) {
    this.user = e, this.isRunning = !1, this.timerId = null, this.errorBackoff = 3e4;
  }
  _start() {
    this.isRunning || (this.isRunning = !0, this.schedule());
  }
  _stop() {
    this.isRunning && (this.isRunning = !1, this.timerId !== null && clearTimeout(this.timerId));
  }
  getInterval(e) {
    if (e) {
      const t = this.errorBackoff;
      return this.errorBackoff = Math.min(
        this.errorBackoff * 2,
        96e4
        /* Duration.RETRY_BACKOFF_MAX */
      ), t;
    } else {
      this.errorBackoff = 3e4;
      const n = (this.user.stsTokenManager.expirationTime ?? 0) - Date.now() - 3e5;
      return Math.max(0, n);
    }
  }
  schedule(e = !1) {
    if (!this.isRunning)
      return;
    const t = this.getInterval(e);
    this.timerId = setTimeout(async () => {
      await this.iteration();
    }, t);
  }
  async iteration() {
    try {
      await this.user.getIdToken(!0);
    } catch (e) {
      e?.code === "auth/network-request-failed" && this.schedule(
        /* wasError */
        !0
      );
      return;
    }
    this.schedule();
  }
}
class Va {
  constructor(e, t) {
    this.createdAt = e, this.lastLoginAt = t, this._initializeTime();
  }
  _initializeTime() {
    this.lastSignInTime = ps(this.lastLoginAt), this.creationTime = ps(this.createdAt);
  }
  _copy(e) {
    this.createdAt = e.createdAt, this.lastLoginAt = e.lastLoginAt, this._initializeTime();
  }
  toJSON() {
    return {
      createdAt: this.createdAt,
      lastLoginAt: this.lastLoginAt
    };
  }
}
async function Xi(r) {
  const e = r.auth, t = await r.getIdToken(), n = await Rs(r, Yi(e, { idToken: t }));
  te(
    n?.users.length,
    e,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  );
  const s = n.users[0];
  r._notifyReloadListener(s);
  const i = s.providerUserInfo?.length ? Nh(s.providerUserInfo) : [], o = Ug(r.providerData, i), B = r.isAnonymous, u = !(r.email && s.passwordHash) && !o?.length, c = B ? u : !1, C = {
    uid: s.localId,
    displayName: s.displayName || null,
    photoURL: s.photoUrl || null,
    email: s.email || null,
    emailVerified: s.emailVerified || !1,
    phoneNumber: s.phoneNumber || null,
    tenantId: s.tenantId || null,
    providerData: o,
    metadata: new Va(s.createdAt, s.lastLoginAt),
    isAnonymous: c
  };
  Object.assign(r, C);
}
async function Hg(r) {
  const e = Re(r);
  await Xi(e), await e.auth._persistUserIfCurrent(e), e.auth._notifyListenersIfCurrent(e);
}
function Ug(r, e) {
  return [...r.filter((n) => !e.some((s) => s.providerId === n.providerId)), ...e];
}
function Nh(r) {
  return r.map(({ providerId: e, ...t }) => ({
    providerId: e,
    uid: t.rawId || "",
    displayName: t.displayName || null,
    email: t.email || null,
    phoneNumber: t.phoneNumber || null,
    photoURL: t.photoUrl || null
  }));
}
async function Jg(r, e) {
  const t = await Oh(r, {}, async () => {
    const n = zs({
      grant_type: "refresh_token",
      refresh_token: e
    }).slice(1), { tokenApiHost: s, apiKey: i } = r.config, o = await bh(r, s, "/v1/token", `key=${i}`), B = await r._getAdditionalHeaders();
    B[
      "Content-Type"
      /* HttpHeader.CONTENT_TYPE */
    ] = "application/x-www-form-urlencoded";
    const u = {
      method: "POST",
      headers: B,
      body: n
    };
    return r.emulatorConfig && Qs(r.emulatorConfig.host) && (u.credentials = "include"), Sh.fetch()(o, u);
  });
  return {
    accessToken: t.access_token,
    expiresIn: t.expires_in,
    refreshToken: t.refresh_token
  };
}
async function jg(r, e) {
  return Fn(r, "POST", "/v2/accounts:revokeToken", rr(r, e));
}
class _r {
  constructor() {
    this.refreshToken = null, this.accessToken = null, this.expirationTime = null;
  }
  get isExpired() {
    return !this.expirationTime || Date.now() > this.expirationTime - 3e4;
  }
  updateFromServerResponse(e) {
    te(
      e.idToken,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), te(
      typeof e.idToken < "u",
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), te(
      typeof e.refreshToken < "u",
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const t = "expiresIn" in e && typeof e.expiresIn < "u" ? Number(e.expiresIn) : yc(e.idToken);
    this.updateTokensAndExpiration(e.idToken, e.refreshToken, t);
  }
  updateFromIdToken(e) {
    te(
      e.length !== 0,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const t = yc(e);
    this.updateTokensAndExpiration(e, null, t);
  }
  async getToken(e, t = !1) {
    return !t && this.accessToken && !this.isExpired ? this.accessToken : (te(
      this.refreshToken,
      e,
      "user-token-expired"
      /* AuthErrorCode.TOKEN_EXPIRED */
    ), this.refreshToken ? (await this.refresh(e, this.refreshToken), this.accessToken) : null);
  }
  clearRefreshToken() {
    this.refreshToken = null;
  }
  async refresh(e, t) {
    const { accessToken: n, refreshToken: s, expiresIn: i } = await Jg(e, t);
    this.updateTokensAndExpiration(n, s, Number(i));
  }
  updateTokensAndExpiration(e, t, n) {
    this.refreshToken = t || null, this.accessToken = e || null, this.expirationTime = Date.now() + n * 1e3;
  }
  static fromJSON(e, t) {
    const { refreshToken: n, accessToken: s, expirationTime: i } = t, o = new _r();
    return n && (te(typeof n == "string", "internal-error", {
      appName: e
    }), o.refreshToken = n), s && (te(typeof s == "string", "internal-error", {
      appName: e
    }), o.accessToken = s), i && (te(typeof i == "number", "internal-error", {
      appName: e
    }), o.expirationTime = i), o;
  }
  toJSON() {
    return {
      refreshToken: this.refreshToken,
      accessToken: this.accessToken,
      expirationTime: this.expirationTime
    };
  }
  _assign(e) {
    this.accessToken = e.accessToken, this.refreshToken = e.refreshToken, this.expirationTime = e.expirationTime;
  }
  _clone() {
    return Object.assign(new _r(), this.toJSON());
  }
  _performRefresh() {
    return Ht("not implemented");
  }
}
function rn(r, e) {
  te(typeof r == "string" || typeof r > "u", "internal-error", { appName: e });
}
class wt {
  constructor({ uid: e, auth: t, stsTokenManager: n, ...s }) {
    this.providerId = "firebase", this.proactiveRefresh = new Gg(this), this.reloadUserInfo = null, this.reloadListener = null, this.uid = e, this.auth = t, this.stsTokenManager = n, this.accessToken = n.accessToken, this.displayName = s.displayName || null, this.email = s.email || null, this.emailVerified = s.emailVerified || !1, this.phoneNumber = s.phoneNumber || null, this.photoURL = s.photoURL || null, this.isAnonymous = s.isAnonymous || !1, this.tenantId = s.tenantId || null, this.providerData = s.providerData ? [...s.providerData] : [], this.metadata = new Va(s.createdAt || void 0, s.lastLoginAt || void 0);
  }
  async getIdToken(e) {
    const t = await Rs(this, this.stsTokenManager.getToken(this.auth, e));
    return te(
      t,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), this.accessToken !== t && (this.accessToken = t, await this.auth._persistUserIfCurrent(this), this.auth._notifyListenersIfCurrent(this)), t;
  }
  getIdTokenResult(e) {
    return xg(this, e);
  }
  reload() {
    return Hg(this);
  }
  _assign(e) {
    this !== e && (te(
      this.uid === e.uid,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), this.displayName = e.displayName, this.photoURL = e.photoURL, this.email = e.email, this.emailVerified = e.emailVerified, this.phoneNumber = e.phoneNumber, this.isAnonymous = e.isAnonymous, this.tenantId = e.tenantId, this.providerData = e.providerData.map((t) => ({ ...t })), this.metadata._copy(e.metadata), this.stsTokenManager._assign(e.stsTokenManager));
  }
  _clone(e) {
    const t = new wt({
      ...this,
      auth: e,
      stsTokenManager: this.stsTokenManager._clone()
    });
    return t.metadata._copy(this.metadata), t;
  }
  _onReload(e) {
    te(
      !this.reloadListener,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), this.reloadListener = e, this.reloadUserInfo && (this._notifyReloadListener(this.reloadUserInfo), this.reloadUserInfo = null);
  }
  _notifyReloadListener(e) {
    this.reloadListener ? this.reloadListener(e) : this.reloadUserInfo = e;
  }
  _startProactiveRefresh() {
    this.proactiveRefresh._start();
  }
  _stopProactiveRefresh() {
    this.proactiveRefresh._stop();
  }
  async _updateTokensIfNecessary(e, t = !1) {
    let n = !1;
    e.idToken && e.idToken !== this.stsTokenManager.accessToken && (this.stsTokenManager.updateFromServerResponse(e), n = !0), t && await Xi(this), await this.auth._persistUserIfCurrent(this), n && this.auth._notifyListenersIfCurrent(this);
  }
  async delete() {
    if (It(this.auth.app))
      return Promise.reject(gn(this.auth));
    const e = await this.getIdToken();
    return await Rs(this, Vg(this.auth, { idToken: e })), this.stsTokenManager.clearRefreshToken(), this.auth.signOut();
  }
  toJSON() {
    return {
      uid: this.uid,
      email: this.email || void 0,
      emailVerified: this.emailVerified,
      displayName: this.displayName || void 0,
      isAnonymous: this.isAnonymous,
      photoURL: this.photoURL || void 0,
      phoneNumber: this.phoneNumber || void 0,
      tenantId: this.tenantId || void 0,
      providerData: this.providerData.map((e) => ({ ...e })),
      stsTokenManager: this.stsTokenManager.toJSON(),
      // Redirect event ID must be maintained in case there is a pending
      // redirect event.
      _redirectEventId: this._redirectEventId,
      ...this.metadata.toJSON(),
      // Required for compatibility with the legacy SDK (go/firebase-auth-sdk-persistence-parsing):
      apiKey: this.auth.config.apiKey,
      appName: this.auth.name
      // Missing authDomain will be tolerated by the legacy SDK.
      // stsTokenManager.apiKey isn't actually required (despite the legacy SDK persisting it).
    };
  }
  get refreshToken() {
    return this.stsTokenManager.refreshToken || "";
  }
  static _fromJSON(e, t) {
    const n = t.displayName ?? void 0, s = t.email ?? void 0, i = t.phoneNumber ?? void 0, o = t.photoURL ?? void 0, B = t.tenantId ?? void 0, u = t._redirectEventId ?? void 0, c = t.createdAt ?? void 0, C = t.lastLoginAt ?? void 0, { uid: f, emailVerified: m, isAnonymous: R, providerData: P, stsTokenManager: x } = t;
    te(
      f && x,
      e,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const H = _r.fromJSON(this.name, x);
    te(
      typeof f == "string",
      e,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), rn(n, e.name), rn(s, e.name), te(
      typeof m == "boolean",
      e,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), te(
      typeof R == "boolean",
      e,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), rn(i, e.name), rn(o, e.name), rn(B, e.name), rn(u, e.name), rn(c, e.name), rn(C, e.name);
    const z = new wt({
      uid: f,
      auth: e,
      email: s,
      emailVerified: m,
      displayName: n,
      isAnonymous: R,
      photoURL: o,
      phoneNumber: i,
      tenantId: B,
      stsTokenManager: H,
      createdAt: c,
      lastLoginAt: C
    });
    return P && Array.isArray(P) && (z.providerData = P.map((se) => ({ ...se }))), u && (z._redirectEventId = u), z;
  }
  /**
   * Initialize a User from an idToken server response
   * @param auth
   * @param idTokenResponse
   */
  static async _fromIdTokenResponse(e, t, n = !1) {
    const s = new _r();
    s.updateFromServerResponse(t);
    const i = new wt({
      uid: t.localId,
      auth: e,
      stsTokenManager: s,
      isAnonymous: n
    });
    return await Xi(i), i;
  }
  /**
   * Initialize a User from an idToken server response
   * @param auth
   * @param idTokenResponse
   */
  static async _fromGetAccountInfoResponse(e, t, n) {
    const s = t.users[0];
    te(
      s.localId !== void 0,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const i = s.providerUserInfo !== void 0 ? Nh(s.providerUserInfo) : [], o = !(s.email && s.passwordHash) && !i?.length, B = new _r();
    B.updateFromIdToken(n);
    const u = new wt({
      uid: s.localId,
      auth: e,
      stsTokenManager: B,
      isAnonymous: o
    }), c = {
      uid: s.localId,
      displayName: s.displayName || null,
      photoURL: s.photoUrl || null,
      email: s.email || null,
      emailVerified: s.emailVerified || !1,
      phoneNumber: s.phoneNumber || null,
      tenantId: s.tenantId || null,
      providerData: i,
      metadata: new Va(s.createdAt, s.lastLoginAt),
      isAnonymous: !(s.email && s.passwordHash) && !i?.length
    };
    return Object.assign(u, c), u;
  }
}
const Tc = /* @__PURE__ */ new Map();
function Ut(r) {
  zt(r instanceof Function, "Expected a class definition");
  let e = Tc.get(r);
  return e ? (zt(e instanceof r, "Instance stored in cache mismatched with class"), e) : (e = new r(), Tc.set(r, e), e);
}
class Fh {
  constructor() {
    this.type = "NONE", this.storage = {};
  }
  async _isAvailable() {
    return !0;
  }
  async _set(e, t) {
    this.storage[e] = t;
  }
  async _get(e) {
    const t = this.storage[e];
    return t === void 0 ? null : t;
  }
  async _remove(e) {
    delete this.storage[e];
  }
  _addListener(e, t) {
  }
  _removeListener(e, t) {
  }
}
Fh.type = "NONE";
const Ac = Fh;
function Gi(r, e, t) {
  return `firebase:${r}:${e}:${t}`;
}
class Dr {
  constructor(e, t, n) {
    this.persistence = e, this.auth = t, this.userKey = n;
    const { config: s, name: i } = this.auth;
    this.fullUserKey = Gi(this.userKey, s.apiKey, i), this.fullPersistenceKey = Gi("persistence", s.apiKey, i), this.boundEventHandler = t._onStorageEvent.bind(t), this.persistence._addListener(this.fullUserKey, this.boundEventHandler);
  }
  setCurrentUser(e) {
    return this.persistence._set(this.fullUserKey, e.toJSON());
  }
  async getCurrentUser() {
    const e = await this.persistence._get(this.fullUserKey);
    if (!e)
      return null;
    if (typeof e == "string") {
      const t = await Yi(this.auth, { idToken: e }).catch(() => {
      });
      return t ? wt._fromGetAccountInfoResponse(this.auth, t, e) : null;
    }
    return wt._fromJSON(this.auth, e);
  }
  removeCurrentUser() {
    return this.persistence._remove(this.fullUserKey);
  }
  savePersistenceForRedirect() {
    return this.persistence._set(this.fullPersistenceKey, this.persistence.type);
  }
  async setPersistence(e) {
    if (this.persistence === e)
      return;
    const t = await this.getCurrentUser();
    if (await this.removeCurrentUser(), this.persistence = e, t)
      return this.setCurrentUser(t);
  }
  delete() {
    this.persistence._removeListener(this.fullUserKey, this.boundEventHandler);
  }
  static async create(e, t, n = "authUser") {
    if (!t.length)
      return new Dr(Ut(Ac), e, n);
    const s = (await Promise.all(t.map(async (c) => {
      if (await c._isAvailable())
        return c;
    }))).filter((c) => c);
    let i = s[0] || Ut(Ac);
    const o = Gi(n, e.config.apiKey, e.name);
    let B = null;
    for (const c of t)
      try {
        const C = await c._get(o);
        if (C) {
          let f;
          if (typeof C == "string") {
            const m = await Yi(e, {
              idToken: C
            }).catch(() => {
            });
            if (!m)
              break;
            f = await wt._fromGetAccountInfoResponse(e, m, C);
          } else
            f = wt._fromJSON(e, C);
          c !== i && (B = f), i = c;
          break;
        }
      } catch {
      }
    const u = s.filter((c) => c._shouldAllowMigration);
    return !i._shouldAllowMigration || !u.length ? new Dr(i, e, n) : (i = u[0], B && await i._set(o, B.toJSON()), await Promise.all(t.map(async (c) => {
      if (c !== i)
        try {
          await c._remove(o);
        } catch {
        }
    })), new Dr(i, e, n));
  }
}
function Rc(r) {
  const e = r.toLowerCase();
  if (e.includes("opera/") || e.includes("opr/") || e.includes("opios/"))
    return "Opera";
  if (xh(e))
    return "IEMobile";
  if (e.includes("msie") || e.includes("trident/"))
    return "IE";
  if (e.includes("edge/"))
    return "Edge";
  if (Lh(e))
    return "Firefox";
  if (e.includes("silk/"))
    return "Silk";
  if (Gh(e))
    return "Blackberry";
  if (Hh(e))
    return "Webos";
  if (kh(e))
    return "Safari";
  if ((e.includes("chrome/") || Vh(e)) && !e.includes("edge/"))
    return "Chrome";
  if (Mh(e))
    return "Android";
  {
    const t = /([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/, n = r.match(t);
    if (n?.length === 2)
      return n[1];
  }
  return "Other";
}
function Lh(r = Qe()) {
  return /firefox\//i.test(r);
}
function kh(r = Qe()) {
  const e = r.toLowerCase();
  return e.includes("safari/") && !e.includes("chrome/") && !e.includes("crios/") && !e.includes("android");
}
function Vh(r = Qe()) {
  return /crios\//i.test(r);
}
function xh(r = Qe()) {
  return /iemobile/i.test(r);
}
function Mh(r = Qe()) {
  return /android/i.test(r);
}
function Gh(r = Qe()) {
  return /blackberry/i.test(r);
}
function Hh(r = Qe()) {
  return /webos/i.test(r);
}
function lB(r = Qe()) {
  return /iphone|ipad|ipod/i.test(r) || /macintosh/i.test(r) && /mobile/i.test(r);
}
function qg(r = Qe()) {
  return lB(r) && !!window.navigator?.standalone;
}
function Kg() {
  return ip() && document.documentMode === 10;
}
function Uh(r = Qe()) {
  return lB(r) || Mh(r) || Hh(r) || Gh(r) || /windows phone/i.test(r) || xh(r);
}
function Jh(r, e = []) {
  let t;
  switch (r) {
    case "Browser":
      t = Rc(Qe());
      break;
    case "Worker":
      t = `${Rc(Qe())}-${r}`;
      break;
    default:
      t = r;
  }
  const n = e.length ? e.join(",") : "FirebaseCore-web";
  return `${t}/JsCore/${Lr}/${n}`;
}
class zg {
  constructor(e) {
    this.auth = e, this.queue = [];
  }
  pushCallback(e, t) {
    const n = (i) => new Promise((o, B) => {
      try {
        const u = e(i);
        o(u);
      } catch (u) {
        B(u);
      }
    });
    n.onAbort = t, this.queue.push(n);
    const s = this.queue.length - 1;
    return () => {
      this.queue[s] = () => Promise.resolve();
    };
  }
  async runMiddleware(e) {
    if (this.auth.currentUser === e)
      return;
    const t = [];
    try {
      for (const n of this.queue)
        await n(e), n.onAbort && t.push(n.onAbort);
    } catch (n) {
      t.reverse();
      for (const s of t)
        try {
          s();
        } catch {
        }
      throw this.auth._errorFactory.create("login-blocked", {
        originalMessage: n?.message
      });
    }
  }
}
async function Qg(r, e = {}) {
  return Fn(r, "GET", "/v2/passwordPolicy", rr(r, e));
}
const Wg = 6;
class $g {
  constructor(e) {
    const t = e.customStrengthOptions;
    this.customStrengthOptions = {}, this.customStrengthOptions.minPasswordLength = t.minPasswordLength ?? Wg, t.maxPasswordLength && (this.customStrengthOptions.maxPasswordLength = t.maxPasswordLength), t.containsLowercaseCharacter !== void 0 && (this.customStrengthOptions.containsLowercaseLetter = t.containsLowercaseCharacter), t.containsUppercaseCharacter !== void 0 && (this.customStrengthOptions.containsUppercaseLetter = t.containsUppercaseCharacter), t.containsNumericCharacter !== void 0 && (this.customStrengthOptions.containsNumericCharacter = t.containsNumericCharacter), t.containsNonAlphanumericCharacter !== void 0 && (this.customStrengthOptions.containsNonAlphanumericCharacter = t.containsNonAlphanumericCharacter), this.enforcementState = e.enforcementState, this.enforcementState === "ENFORCEMENT_STATE_UNSPECIFIED" && (this.enforcementState = "OFF"), this.allowedNonAlphanumericCharacters = e.allowedNonAlphanumericCharacters?.join("") ?? "", this.forceUpgradeOnSignin = e.forceUpgradeOnSignin ?? !1, this.schemaVersion = e.schemaVersion;
  }
  validatePassword(e) {
    const t = {
      isValid: !0,
      passwordPolicy: this
    };
    return this.validatePasswordLengthOptions(e, t), this.validatePasswordCharacterOptions(e, t), t.isValid && (t.isValid = t.meetsMinPasswordLength ?? !0), t.isValid && (t.isValid = t.meetsMaxPasswordLength ?? !0), t.isValid && (t.isValid = t.containsLowercaseLetter ?? !0), t.isValid && (t.isValid = t.containsUppercaseLetter ?? !0), t.isValid && (t.isValid = t.containsNumericCharacter ?? !0), t.isValid && (t.isValid = t.containsNonAlphanumericCharacter ?? !0), t;
  }
  /**
   * Validates that the password meets the length options for the policy.
   *
   * @param password Password to validate.
   * @param status Validation status.
   */
  validatePasswordLengthOptions(e, t) {
    const n = this.customStrengthOptions.minPasswordLength, s = this.customStrengthOptions.maxPasswordLength;
    n && (t.meetsMinPasswordLength = e.length >= n), s && (t.meetsMaxPasswordLength = e.length <= s);
  }
  /**
   * Validates that the password meets the character options for the policy.
   *
   * @param password Password to validate.
   * @param status Validation status.
   */
  validatePasswordCharacterOptions(e, t) {
    this.updatePasswordCharacterOptionsStatuses(
      t,
      /* containsLowercaseCharacter= */
      !1,
      /* containsUppercaseCharacter= */
      !1,
      /* containsNumericCharacter= */
      !1,
      /* containsNonAlphanumericCharacter= */
      !1
    );
    let n;
    for (let s = 0; s < e.length; s++)
      n = e.charAt(s), this.updatePasswordCharacterOptionsStatuses(
        t,
        /* containsLowercaseCharacter= */
        n >= "a" && n <= "z",
        /* containsUppercaseCharacter= */
        n >= "A" && n <= "Z",
        /* containsNumericCharacter= */
        n >= "0" && n <= "9",
        /* containsNonAlphanumericCharacter= */
        this.allowedNonAlphanumericCharacters.includes(n)
      );
  }
  /**
   * Updates the running validation status with the statuses for the character options.
   * Expected to be called each time a character is processed to update each option status
   * based on the current character.
   *
   * @param status Validation status.
   * @param containsLowercaseCharacter Whether the character is a lowercase letter.
   * @param containsUppercaseCharacter Whether the character is an uppercase letter.
   * @param containsNumericCharacter Whether the character is a numeric character.
   * @param containsNonAlphanumericCharacter Whether the character is a non-alphanumeric character.
   */
  updatePasswordCharacterOptionsStatuses(e, t, n, s, i) {
    this.customStrengthOptions.containsLowercaseLetter && (e.containsLowercaseLetter || (e.containsLowercaseLetter = t)), this.customStrengthOptions.containsUppercaseLetter && (e.containsUppercaseLetter || (e.containsUppercaseLetter = n)), this.customStrengthOptions.containsNumericCharacter && (e.containsNumericCharacter || (e.containsNumericCharacter = s)), this.customStrengthOptions.containsNonAlphanumericCharacter && (e.containsNonAlphanumericCharacter || (e.containsNonAlphanumericCharacter = i));
  }
}
class Yg {
  constructor(e, t, n, s) {
    this.app = e, this.heartbeatServiceProvider = t, this.appCheckServiceProvider = n, this.config = s, this.currentUser = null, this.emulatorConfig = null, this.operations = Promise.resolve(), this.authStateSubscription = new vc(this), this.idTokenSubscription = new vc(this), this.beforeStateQueue = new zg(this), this.redirectUser = null, this.isProactiveRefreshEnabled = !1, this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION = 1, this._canInitEmulator = !0, this._isInitialized = !1, this._deleted = !1, this._initializationPromise = null, this._popupRedirectResolver = null, this._errorFactory = Rh, this._agentRecaptchaConfig = null, this._tenantRecaptchaConfigs = {}, this._projectPasswordPolicy = null, this._tenantPasswordPolicies = {}, this._resolvePersistenceManagerAvailable = void 0, this.lastNotifiedUid = void 0, this.languageCode = null, this.tenantId = null, this.settings = { appVerificationDisabledForTesting: !1 }, this.frameworks = [], this.name = e.name, this.clientVersion = s.sdkClientVersion, this._persistenceManagerAvailable = new Promise((i) => this._resolvePersistenceManagerAvailable = i);
  }
  _initializeWithPersistence(e, t) {
    return t && (this._popupRedirectResolver = Ut(t)), this._initializationPromise = this.queue(async () => {
      if (!this._deleted && (this.persistenceManager = await Dr.create(this, e), this._resolvePersistenceManagerAvailable?.(), !this._deleted)) {
        if (this._popupRedirectResolver?._shouldInitProactively)
          try {
            await this._popupRedirectResolver._initialize(this);
          } catch {
          }
        await this.initializeCurrentUser(t), this.lastNotifiedUid = this.currentUser?.uid || null, !this._deleted && (this._isInitialized = !0);
      }
    }), this._initializationPromise;
  }
  /**
   * If the persistence is changed in another window, the user manager will let us know
   */
  async _onStorageEvent() {
    if (this._deleted)
      return;
    const e = await this.assertedPersistence.getCurrentUser();
    if (!(!this.currentUser && !e)) {
      if (this.currentUser && e && this.currentUser.uid === e.uid) {
        this._currentUser._assign(e), await this.currentUser.getIdToken();
        return;
      }
      await this._updateCurrentUser(
        e,
        /* skipBeforeStateCallbacks */
        !0
      );
    }
  }
  async initializeCurrentUserFromIdToken(e) {
    try {
      const t = await Yi(this, { idToken: e }), n = await wt._fromGetAccountInfoResponse(this, t, e);
      await this.directlySetCurrentUser(n);
    } catch (t) {
      console.warn("FirebaseServerApp could not login user with provided authIdToken: ", t), await this.directlySetCurrentUser(null);
    }
  }
  async initializeCurrentUser(e) {
    if (It(this.app)) {
      const i = this.app.settings.authIdToken;
      return i ? new Promise((o) => {
        setTimeout(() => this.initializeCurrentUserFromIdToken(i).then(o, o));
      }) : this.directlySetCurrentUser(null);
    }
    const t = await this.assertedPersistence.getCurrentUser();
    let n = t, s = !1;
    if (e && this.config.authDomain) {
      await this.getOrInitRedirectPersistenceManager();
      const i = this.redirectUser?._redirectEventId, o = n?._redirectEventId, B = await this.tryRedirectSignIn(e);
      (!i || i === o) && B?.user && (n = B.user, s = !0);
    }
    if (!n)
      return this.directlySetCurrentUser(null);
    if (!n._redirectEventId) {
      if (s)
        try {
          await this.beforeStateQueue.runMiddleware(n);
        } catch (i) {
          n = t, this._popupRedirectResolver._overrideRedirectResult(this, () => Promise.reject(i));
        }
      return n ? this.reloadAndSetCurrentUserOrClear(n) : this.directlySetCurrentUser(null);
    }
    return te(
      this._popupRedirectResolver,
      this,
      "argument-error"
      /* AuthErrorCode.ARGUMENT_ERROR */
    ), await this.getOrInitRedirectPersistenceManager(), this.redirectUser && this.redirectUser._redirectEventId === n._redirectEventId ? this.directlySetCurrentUser(n) : this.reloadAndSetCurrentUserOrClear(n);
  }
  async tryRedirectSignIn(e) {
    let t = null;
    try {
      t = await this._popupRedirectResolver._completeRedirectFn(this, e, !0);
    } catch {
      await this._setRedirectUser(null);
    }
    return t;
  }
  async reloadAndSetCurrentUserOrClear(e) {
    try {
      await Xi(e);
    } catch (t) {
      if (t?.code !== "auth/network-request-failed")
        return this.directlySetCurrentUser(null);
    }
    return this.directlySetCurrentUser(e);
  }
  useDeviceLanguage() {
    this.languageCode = Pg();
  }
  async _delete() {
    this._deleted = !0;
  }
  async updateCurrentUser(e) {
    if (It(this.app))
      return Promise.reject(gn(this));
    const t = e ? Re(e) : null;
    return t && te(
      t.auth.config.apiKey === this.config.apiKey,
      this,
      "invalid-user-token"
      /* AuthErrorCode.INVALID_AUTH */
    ), this._updateCurrentUser(t && t._clone(this));
  }
  async _updateCurrentUser(e, t = !1) {
    if (!this._deleted)
      return e && te(
        this.tenantId === e.tenantId,
        this,
        "tenant-id-mismatch"
        /* AuthErrorCode.TENANT_ID_MISMATCH */
      ), t || await this.beforeStateQueue.runMiddleware(e), this.queue(async () => {
        await this.directlySetCurrentUser(e), this.notifyAuthListeners();
      });
  }
  async signOut() {
    return It(this.app) ? Promise.reject(gn(this)) : (await this.beforeStateQueue.runMiddleware(null), (this.redirectPersistenceManager || this._popupRedirectResolver) && await this._setRedirectUser(null), this._updateCurrentUser(
      null,
      /* skipBeforeStateCallbacks */
      !0
    ));
  }
  setPersistence(e) {
    return It(this.app) ? Promise.reject(gn(this)) : this.queue(async () => {
      await this.assertedPersistence.setPersistence(Ut(e));
    });
  }
  _getRecaptchaConfig() {
    return this.tenantId == null ? this._agentRecaptchaConfig : this._tenantRecaptchaConfigs[this.tenantId];
  }
  async validatePassword(e) {
    this._getPasswordPolicyInternal() || await this._updatePasswordPolicy();
    const t = this._getPasswordPolicyInternal();
    return t.schemaVersion !== this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION ? Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version", {})) : t.validatePassword(e);
  }
  _getPasswordPolicyInternal() {
    return this.tenantId === null ? this._projectPasswordPolicy : this._tenantPasswordPolicies[this.tenantId];
  }
  async _updatePasswordPolicy() {
    const e = await Qg(this), t = new $g(e);
    this.tenantId === null ? this._projectPasswordPolicy = t : this._tenantPasswordPolicies[this.tenantId] = t;
  }
  _getPersistenceType() {
    return this.assertedPersistence.persistence.type;
  }
  _getPersistence() {
    return this.assertedPersistence.persistence;
  }
  _updateErrorMap(e) {
    this._errorFactory = new Ks("auth", "Firebase", e());
  }
  onAuthStateChanged(e, t, n) {
    return this.registerStateListener(this.authStateSubscription, e, t, n);
  }
  beforeAuthStateChanged(e, t) {
    return this.beforeStateQueue.pushCallback(e, t);
  }
  onIdTokenChanged(e, t, n) {
    return this.registerStateListener(this.idTokenSubscription, e, t, n);
  }
  authStateReady() {
    return new Promise((e, t) => {
      if (this.currentUser)
        e();
      else {
        const n = this.onAuthStateChanged(() => {
          n(), e();
        }, t);
      }
    });
  }
  /**
   * Revokes the given access token. Currently only supports Apple OAuth access tokens.
   */
  async revokeAccessToken(e) {
    if (this.currentUser) {
      const t = await this.currentUser.getIdToken(), n = {
        providerId: "apple.com",
        tokenType: "ACCESS_TOKEN",
        token: e,
        idToken: t
      };
      this.tenantId != null && (n.tenantId = this.tenantId), await jg(this, n);
    }
  }
  toJSON() {
    return {
      apiKey: this.config.apiKey,
      authDomain: this.config.authDomain,
      appName: this.name,
      currentUser: this._currentUser?.toJSON()
    };
  }
  async _setRedirectUser(e, t) {
    const n = await this.getOrInitRedirectPersistenceManager(t);
    return e === null ? n.removeCurrentUser() : n.setCurrentUser(e);
  }
  async getOrInitRedirectPersistenceManager(e) {
    if (!this.redirectPersistenceManager) {
      const t = e && Ut(e) || this._popupRedirectResolver;
      te(
        t,
        this,
        "argument-error"
        /* AuthErrorCode.ARGUMENT_ERROR */
      ), this.redirectPersistenceManager = await Dr.create(
        this,
        [Ut(t._redirectPersistence)],
        "redirectUser"
        /* KeyName.REDIRECT_USER */
      ), this.redirectUser = await this.redirectPersistenceManager.getCurrentUser();
    }
    return this.redirectPersistenceManager;
  }
  async _redirectUserForId(e) {
    return this._isInitialized && await this.queue(async () => {
    }), this._currentUser?._redirectEventId === e ? this._currentUser : this.redirectUser?._redirectEventId === e ? this.redirectUser : null;
  }
  async _persistUserIfCurrent(e) {
    if (e === this.currentUser)
      return this.queue(async () => this.directlySetCurrentUser(e));
  }
  /** Notifies listeners only if the user is current */
  _notifyListenersIfCurrent(e) {
    e === this.currentUser && this.notifyAuthListeners();
  }
  _key() {
    return `${this.config.authDomain}:${this.config.apiKey}:${this.name}`;
  }
  _startProactiveRefresh() {
    this.isProactiveRefreshEnabled = !0, this.currentUser && this._currentUser._startProactiveRefresh();
  }
  _stopProactiveRefresh() {
    this.isProactiveRefreshEnabled = !1, this.currentUser && this._currentUser._stopProactiveRefresh();
  }
  /** Returns the current user cast as the internal type */
  get _currentUser() {
    return this.currentUser;
  }
  notifyAuthListeners() {
    if (!this._isInitialized)
      return;
    this.idTokenSubscription.next(this.currentUser);
    const e = this.currentUser?.uid ?? null;
    this.lastNotifiedUid !== e && (this.lastNotifiedUid = e, this.authStateSubscription.next(this.currentUser));
  }
  registerStateListener(e, t, n, s) {
    if (this._deleted)
      return () => {
      };
    const i = typeof t == "function" ? t : t.next.bind(t);
    let o = !1;
    const B = this._isInitialized ? Promise.resolve() : this._initializationPromise;
    if (te(
      B,
      this,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), B.then(() => {
      o || i(this.currentUser);
    }), typeof t == "function") {
      const u = e.addObserver(t, n, s);
      return () => {
        o = !0, u();
      };
    } else {
      const u = e.addObserver(t);
      return () => {
        o = !0, u();
      };
    }
  }
  /**
   * Unprotected (from race conditions) method to set the current user. This
   * should only be called from within a queued callback. This is necessary
   * because the queue shouldn't rely on another queued callback.
   */
  async directlySetCurrentUser(e) {
    this.currentUser && this.currentUser !== e && this._currentUser._stopProactiveRefresh(), e && this.isProactiveRefreshEnabled && e._startProactiveRefresh(), this.currentUser = e, e ? await this.assertedPersistence.setCurrentUser(e) : await this.assertedPersistence.removeCurrentUser();
  }
  queue(e) {
    return this.operations = this.operations.then(e, e), this.operations;
  }
  get assertedPersistence() {
    return te(
      this.persistenceManager,
      this,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), this.persistenceManager;
  }
  _logFramework(e) {
    !e || this.frameworks.includes(e) || (this.frameworks.push(e), this.frameworks.sort(), this.clientVersion = Jh(this.config.clientPlatform, this._getFrameworks()));
  }
  _getFrameworks() {
    return this.frameworks;
  }
  async _getAdditionalHeaders() {
    const e = {
      "X-Client-Version": this.clientVersion
    };
    this.app.options.appId && (e[
      "X-Firebase-gmpid"
      /* HttpHeader.X_FIREBASE_GMPID */
    ] = this.app.options.appId);
    const t = await this.heartbeatServiceProvider.getImmediate({
      optional: !0
    })?.getHeartbeatsHeader();
    t && (e[
      "X-Firebase-Client"
      /* HttpHeader.X_FIREBASE_CLIENT */
    ] = t);
    const n = await this._getAppCheckToken();
    return n && (e[
      "X-Firebase-AppCheck"
      /* HttpHeader.X_FIREBASE_APP_CHECK */
    ] = n), e;
  }
  async _getAppCheckToken() {
    if (It(this.app) && this.app.settings.appCheckToken)
      return this.app.settings.appCheckToken;
    const e = await this.appCheckServiceProvider.getImmediate({ optional: !0 })?.getToken();
    return e?.error && vh(`Error while retrieving App Check token: ${e.error}`), e?.token;
  }
}
function kr(r) {
  return Re(r);
}
class vc {
  constructor(e) {
    this.auth = e, this.observer = null, this.addObserver = hp((t) => this.observer = t);
  }
  get next() {
    return te(
      this.observer,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), this.observer.next.bind(this.observer);
  }
}
let Do = {
  async loadJS() {
    throw new Error("Unable to load external scripts");
  },
  recaptchaV2Script: "",
  recaptchaEnterpriseScript: "",
  gapiScript: ""
};
function Xg(r) {
  Do = r;
}
function jh(r) {
  return Do.loadJS(r);
}
function Zg() {
  return Do.recaptchaEnterpriseScript;
}
function em() {
  return Do.gapiScript;
}
function tm(r) {
  return `__${r}${Math.floor(Math.random() * 1e6)}`;
}
class nm {
  constructor() {
    this.enterprise = new rm();
  }
  ready(e) {
    e();
  }
  execute(e, t) {
    return Promise.resolve("token");
  }
  render(e, t) {
    return "";
  }
}
class rm {
  ready(e) {
    e();
  }
  execute(e, t) {
    return Promise.resolve("token");
  }
  render(e, t) {
    return "";
  }
}
const sm = "recaptcha-enterprise", qh = "NO_RECAPTCHA", Pc = "onFirebaseAuthREInstanceReady";
class Bn {
  /**
   *
   * @param authExtern - The corresponding Firebase {@link Auth} instance.
   *
   */
  constructor(e) {
    this.type = sm, this.auth = kr(e);
  }
  /**
   * Executes the verification process.
   *
   * @returns A Promise for a token that can be used to assert the validity of a request.
   */
  async verify(e = "verify", t = !1) {
    async function n(i) {
      if (!t) {
        if (i.tenantId == null && i._agentRecaptchaConfig != null)
          return i._agentRecaptchaConfig.siteKey;
        if (i.tenantId != null && i._tenantRecaptchaConfigs[i.tenantId] !== void 0)
          return i._tenantRecaptchaConfigs[i.tenantId].siteKey;
      }
      return new Promise(async (o, B) => {
        kg(i, {
          clientType: "CLIENT_TYPE_WEB",
          version: "RECAPTCHA_ENTERPRISE"
          /* RecaptchaVersion.ENTERPRISE */
        }).then((u) => {
          if (u.recaptchaKey === void 0)
            B(new Error("recaptcha Enterprise site key undefined"));
          else {
            const c = new Lg(u);
            return i.tenantId == null ? i._agentRecaptchaConfig = c : i._tenantRecaptchaConfigs[i.tenantId] = c, o(c.siteKey);
          }
        }).catch((u) => {
          B(u);
        });
      });
    }
    function s(i, o, B) {
      const u = window.grecaptcha;
      wc(u) ? u.enterprise.ready(() => {
        u.enterprise.execute(i, { action: e }).then((c) => {
          o(c);
        }).catch(() => {
          o(qh);
        });
      }) : B(Error("No reCAPTCHA enterprise script loaded."));
    }
    return this.auth.settings.appVerificationDisabledForTesting ? new nm().execute("siteKey", { action: "verify" }) : new Promise((i, o) => {
      n(this.auth).then(async (B) => {
        if (!t && wc(window.grecaptcha) && // If download has already been initiated, do not trigger another
        // download, await the promise here.
        Bn.scriptInjectionDeferred)
          await Bn.scriptInjectionDeferred.promise, s(B, i, o);
        else {
          if (typeof window > "u") {
            o(new Error("RecaptchaVerifier is only supported in browser"));
            return;
          }
          let u = Zg();
          u.length !== 0 && (u += B + `&onload=${Pc}`), Bn.scriptInjectionDeferred = new Eh(), window[Pc] = () => {
            Bn.scriptInjectionDeferred?.resolve();
          }, jh(u).then(() => Bn.scriptInjectionDeferred?.promise).then(() => {
            s(B, i, o);
          }).catch((c) => {
            o(c);
          });
        }
      }).catch((B) => {
        o(B);
      });
    });
  }
}
Bn.scriptInjectionDeferred = null;
async function Sc(r, e, t, n = !1, s = !1) {
  const i = new Bn(r);
  let o;
  if (s)
    o = qh;
  else
    try {
      o = await i.verify(t);
    } catch {
      o = await i.verify(t, !0);
    }
  const B = { ...e };
  if (t === "mfaSmsEnrollment" || t === "mfaSmsSignIn") {
    if ("phoneEnrollmentInfo" in B) {
      const u = B.phoneEnrollmentInfo.phoneNumber, c = B.phoneEnrollmentInfo.recaptchaToken;
      Object.assign(B, {
        phoneEnrollmentInfo: {
          phoneNumber: u,
          recaptchaToken: c,
          captchaResponse: o,
          clientType: "CLIENT_TYPE_WEB",
          recaptchaVersion: "RECAPTCHA_ENTERPRISE"
          /* RecaptchaVersion.ENTERPRISE */
        }
      });
    } else if ("phoneSignInInfo" in B) {
      const u = B.phoneSignInInfo.recaptchaToken;
      Object.assign(B, {
        phoneSignInInfo: {
          recaptchaToken: u,
          captchaResponse: o,
          clientType: "CLIENT_TYPE_WEB",
          recaptchaVersion: "RECAPTCHA_ENTERPRISE"
          /* RecaptchaVersion.ENTERPRISE */
        }
      });
    }
    return B;
  }
  return n ? Object.assign(B, { captchaResp: o }) : Object.assign(B, { captchaResponse: o }), Object.assign(B, {
    clientType: "CLIENT_TYPE_WEB"
    /* RecaptchaClientType.WEB */
  }), Object.assign(B, {
    recaptchaVersion: "RECAPTCHA_ENTERPRISE"
    /* RecaptchaVersion.ENTERPRISE */
  }), B;
}
async function Oc(r, e, t, n, s) {
  if (r._getRecaptchaConfig()?.isProviderEnabled(
    "EMAIL_PASSWORD_PROVIDER"
    /* RecaptchaAuthProvider.EMAIL_PASSWORD_PROVIDER */
  )) {
    const i = await Sc(
      r,
      e,
      t,
      t === "getOobCode"
      /* RecaptchaActionName.GET_OOB_CODE */
    );
    return n(r, i);
  } else
    return n(r, e).catch(async (i) => {
      if (i.code === "auth/missing-recaptcha-token") {
        console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);
        const o = await Sc(
          r,
          e,
          t,
          t === "getOobCode"
          /* RecaptchaActionName.GET_OOB_CODE */
        );
        return n(r, o);
      } else
        return Promise.reject(i);
    });
}
function im(r, e) {
  const t = aB(r, "auth");
  if (t.isInitialized()) {
    const s = t.getImmediate(), i = t.getOptions();
    if (Yn(i, e ?? {}))
      return s;
    yt(
      s,
      "already-initialized"
      /* AuthErrorCode.ALREADY_INITIALIZED */
    );
  }
  return t.initialize({ options: e });
}
function om(r, e) {
  const t = e?.persistence || [], n = (Array.isArray(t) ? t : [t]).map(Ut);
  e?.errorMap && r._updateErrorMap(e.errorMap), r._initializeWithPersistence(n, e?.popupRedirectResolver);
}
function am(r, e, t) {
  const n = kr(r);
  te(
    /^https?:\/\//.test(e),
    n,
    "invalid-emulator-scheme"
    /* AuthErrorCode.INVALID_EMULATOR_SCHEME */
  );
  const s = !1, i = Kh(e), { host: o, port: B } = Bm(e), u = B === null ? "" : `:${B}`, c = { url: `${i}//${o}${u}/` }, C = Object.freeze({
    host: o,
    port: B,
    protocol: i.replace(":", ""),
    options: Object.freeze({ disableWarnings: s })
  });
  if (!n._canInitEmulator) {
    te(
      n.config.emulator && n.emulatorConfig,
      n,
      "emulator-config-failed"
      /* AuthErrorCode.EMULATOR_CONFIG_FAILED */
    ), te(
      Yn(c, n.config.emulator) && Yn(C, n.emulatorConfig),
      n,
      "emulator-config-failed"
      /* AuthErrorCode.EMULATOR_CONFIG_FAILED */
    );
    return;
  }
  n.config.emulator = c, n.emulatorConfig = C, n.settings.appVerificationDisabledForTesting = !0, Qs(o) ? _h(`${i}//${o}${u}`) : um();
}
function Kh(r) {
  const e = r.indexOf(":");
  return e < 0 ? "" : r.substr(0, e + 1);
}
function Bm(r) {
  const e = Kh(r), t = /(\/\/)?([^?#/]+)/.exec(r.substr(e.length));
  if (!t)
    return { host: "", port: null };
  const n = t[2].split("@").pop() || "", s = /^(\[[^\]]+\])(:|$)/.exec(n);
  if (s) {
    const i = s[1];
    return { host: i, port: bc(n.substr(i.length + 1)) };
  } else {
    const [i, o] = n.split(":");
    return { host: i, port: bc(o) };
  }
}
function bc(r) {
  if (!r)
    return null;
  const e = Number(r);
  return isNaN(e) ? null : e;
}
function um() {
  function r() {
    const e = document.createElement("p"), t = e.style;
    e.innerText = "Running in emulator mode. Do not use with production credentials.", t.position = "fixed", t.width = "100%", t.backgroundColor = "#ffffff", t.border = ".1em solid #000000", t.color = "#b50000", t.bottom = "0px", t.left = "0px", t.margin = "0px", t.zIndex = "10000", t.textAlign = "center", e.classList.add("firebase-emulator-warning"), document.body.appendChild(e);
  }
  typeof console < "u" && typeof console.info == "function" && console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."), typeof window < "u" && typeof document < "u" && (document.readyState === "loading" ? window.addEventListener("DOMContentLoaded", r) : r());
}
class hB {
  /** @internal */
  constructor(e, t) {
    this.providerId = e, this.signInMethod = t;
  }
  /**
   * Returns a JSON-serializable representation of this object.
   *
   * @returns a JSON-serializable representation of this object.
   */
  toJSON() {
    return Ht("not implemented");
  }
  /** @internal */
  _getIdTokenResponse(e) {
    return Ht("not implemented");
  }
  /** @internal */
  _linkToIdToken(e, t) {
    return Ht("not implemented");
  }
  /** @internal */
  _getReauthenticationResolver(e) {
    return Ht("not implemented");
  }
}
async function cm(r, e) {
  return Fn(r, "POST", "/v1/accounts:signUp", e);
}
async function lm(r, e) {
  return _o(r, "POST", "/v1/accounts:signInWithPassword", rr(r, e));
}
async function hm(r, e) {
  return _o(r, "POST", "/v1/accounts:signInWithEmailLink", rr(r, e));
}
async function Cm(r, e) {
  return _o(r, "POST", "/v1/accounts:signInWithEmailLink", rr(r, e));
}
class vs extends hB {
  /** @internal */
  constructor(e, t, n, s = null) {
    super("password", n), this._email = e, this._password = t, this._tenantId = s;
  }
  /** @internal */
  static _fromEmailAndPassword(e, t) {
    return new vs(
      e,
      t,
      "password"
      /* SignInMethod.EMAIL_PASSWORD */
    );
  }
  /** @internal */
  static _fromEmailAndCode(e, t, n = null) {
    return new vs(e, t, "emailLink", n);
  }
  /** {@inheritdoc AuthCredential.toJSON} */
  toJSON() {
    return {
      email: this._email,
      password: this._password,
      signInMethod: this.signInMethod,
      tenantId: this._tenantId
    };
  }
  /**
   * Static method to deserialize a JSON representation of an object into an {@link  AuthCredential}.
   *
   * @param json - Either `object` or the stringified representation of the object. When string is
   * provided, `JSON.parse` would be called first.
   *
   * @returns If the JSON input does not represent an {@link AuthCredential}, null is returned.
   */
  static fromJSON(e) {
    const t = typeof e == "string" ? JSON.parse(e) : e;
    if (t?.email && t?.password) {
      if (t.signInMethod === "password")
        return this._fromEmailAndPassword(t.email, t.password);
      if (t.signInMethod === "emailLink")
        return this._fromEmailAndCode(t.email, t.password, t.tenantId);
    }
    return null;
  }
  /** @internal */
  async _getIdTokenResponse(e) {
    switch (this.signInMethod) {
      case "password":
        const t = {
          returnSecureToken: !0,
          email: this._email,
          password: this._password,
          clientType: "CLIENT_TYPE_WEB"
          /* RecaptchaClientType.WEB */
        };
        return Oc(e, t, "signInWithPassword", lm);
      case "emailLink":
        return hm(e, {
          email: this._email,
          oobCode: this._password
        });
      default:
        yt(
          e,
          "internal-error"
          /* AuthErrorCode.INTERNAL_ERROR */
        );
    }
  }
  /** @internal */
  async _linkToIdToken(e, t) {
    switch (this.signInMethod) {
      case "password":
        const n = {
          idToken: t,
          returnSecureToken: !0,
          email: this._email,
          password: this._password,
          clientType: "CLIENT_TYPE_WEB"
          /* RecaptchaClientType.WEB */
        };
        return Oc(e, n, "signUpPassword", cm);
      case "emailLink":
        return Cm(e, {
          idToken: t,
          email: this._email,
          oobCode: this._password
        });
      default:
        yt(
          e,
          "internal-error"
          /* AuthErrorCode.INTERNAL_ERROR */
        );
    }
  }
  /** @internal */
  _getReauthenticationResolver(e) {
    return this._getIdTokenResponse(e);
  }
}
async function Ir(r, e) {
  return _o(r, "POST", "/v1/accounts:signInWithIdp", rr(r, e));
}
const fm = "http://localhost";
class Zn extends hB {
  constructor() {
    super(...arguments), this.pendingToken = null;
  }
  /** @internal */
  static _fromParams(e) {
    const t = new Zn(e.providerId, e.signInMethod);
    return e.idToken || e.accessToken ? (e.idToken && (t.idToken = e.idToken), e.accessToken && (t.accessToken = e.accessToken), e.nonce && !e.pendingToken && (t.nonce = e.nonce), e.pendingToken && (t.pendingToken = e.pendingToken)) : e.oauthToken && e.oauthTokenSecret ? (t.accessToken = e.oauthToken, t.secret = e.oauthTokenSecret) : yt(
      "argument-error"
      /* AuthErrorCode.ARGUMENT_ERROR */
    ), t;
  }
  /** {@inheritdoc AuthCredential.toJSON}  */
  toJSON() {
    return {
      idToken: this.idToken,
      accessToken: this.accessToken,
      secret: this.secret,
      nonce: this.nonce,
      pendingToken: this.pendingToken,
      providerId: this.providerId,
      signInMethod: this.signInMethod
    };
  }
  /**
   * Static method to deserialize a JSON representation of an object into an
   * {@link  AuthCredential}.
   *
   * @param json - Input can be either Object or the stringified representation of the object.
   * When string is provided, JSON.parse would be called first.
   *
   * @returns If the JSON input does not represent an {@link  AuthCredential}, null is returned.
   */
  static fromJSON(e) {
    const t = typeof e == "string" ? JSON.parse(e) : e, { providerId: n, signInMethod: s, ...i } = t;
    if (!n || !s)
      return null;
    const o = new Zn(n, s);
    return o.idToken = i.idToken || void 0, o.accessToken = i.accessToken || void 0, o.secret = i.secret, o.nonce = i.nonce, o.pendingToken = i.pendingToken || null, o;
  }
  /** @internal */
  _getIdTokenResponse(e) {
    const t = this.buildRequest();
    return Ir(e, t);
  }
  /** @internal */
  _linkToIdToken(e, t) {
    const n = this.buildRequest();
    return n.idToken = t, Ir(e, n);
  }
  /** @internal */
  _getReauthenticationResolver(e) {
    const t = this.buildRequest();
    return t.autoCreate = !1, Ir(e, t);
  }
  buildRequest() {
    const e = {
      requestUri: fm,
      returnSecureToken: !0
    };
    if (this.pendingToken)
      e.pendingToken = this.pendingToken;
    else {
      const t = {};
      this.idToken && (t.id_token = this.idToken), this.accessToken && (t.access_token = this.accessToken), this.secret && (t.oauth_token_secret = this.secret), t.providerId = this.providerId, this.nonce && !this.pendingToken && (t.nonce = this.nonce), e.postBody = zs(t);
    }
    return e;
  }
}
function dm(r) {
  switch (r) {
    case "recoverEmail":
      return "RECOVER_EMAIL";
    case "resetPassword":
      return "PASSWORD_RESET";
    case "signIn":
      return "EMAIL_SIGNIN";
    case "verifyEmail":
      return "VERIFY_EMAIL";
    case "verifyAndChangeEmail":
      return "VERIFY_AND_CHANGE_EMAIL";
    case "revertSecondFactorAddition":
      return "REVERT_SECOND_FACTOR_ADDITION";
    default:
      return null;
  }
}
function pm(r) {
  const e = cs(ls(r)).link, t = e ? cs(ls(e)).deep_link_id : null, n = cs(ls(r)).deep_link_id;
  return (n ? cs(ls(n)).link : null) || n || t || e || r;
}
class CB {
  /**
   * @param actionLink - The link from which to extract the URL.
   * @returns The {@link ActionCodeURL} object, or null if the link is invalid.
   *
   * @internal
   */
  constructor(e) {
    const t = cs(ls(e)), n = t.apiKey ?? null, s = t.oobCode ?? null, i = dm(t.mode ?? null);
    te(
      n && s && i,
      "argument-error"
      /* AuthErrorCode.ARGUMENT_ERROR */
    ), this.apiKey = n, this.operation = i, this.code = s, this.continueUrl = t.continueUrl ?? null, this.languageCode = t.lang ?? null, this.tenantId = t.tenantId ?? null;
  }
  /**
   * Parses the email action link string and returns an {@link ActionCodeURL} if the link is valid,
   * otherwise returns null.
   *
   * @param link  - The email action link string.
   * @returns The {@link ActionCodeURL} object, or null if the link is invalid.
   *
   * @public
   */
  static parseLink(e) {
    const t = pm(e);
    try {
      return new CB(t);
    } catch {
      return null;
    }
  }
}
class Vr {
  constructor() {
    this.providerId = Vr.PROVIDER_ID;
  }
  /**
   * Initialize an {@link AuthCredential} using an email and password.
   *
   * @example
   * ```javascript
   * const authCredential = EmailAuthProvider.credential(email, password);
   * const userCredential = await signInWithCredential(auth, authCredential);
   * ```
   *
   * @example
   * ```javascript
   * const userCredential = await signInWithEmailAndPassword(auth, email, password);
   * ```
   *
   * @param email - Email address.
   * @param password - User account password.
   * @returns The auth provider credential.
   */
  static credential(e, t) {
    return vs._fromEmailAndPassword(e, t);
  }
  /**
   * Initialize an {@link AuthCredential} using an email and an email link after a sign in with
   * email link operation.
   *
   * @example
   * ```javascript
   * const authCredential = EmailAuthProvider.credentialWithLink(auth, email, emailLink);
   * const userCredential = await signInWithCredential(auth, authCredential);
   * ```
   *
   * @example
   * ```javascript
   * await sendSignInLinkToEmail(auth, email);
   * // Obtain emailLink from user.
   * const userCredential = await signInWithEmailLink(auth, email, emailLink);
   * ```
   *
   * @param auth - The {@link Auth} instance used to verify the link.
   * @param email - Email address.
   * @param emailLink - Sign-in email link.
   * @returns - The auth provider credential.
   */
  static credentialWithLink(e, t) {
    const n = CB.parseLink(t);
    return te(
      n,
      "argument-error"
      /* AuthErrorCode.ARGUMENT_ERROR */
    ), vs._fromEmailAndCode(e, n.code, n.tenantId);
  }
}
Vr.PROVIDER_ID = "password";
Vr.EMAIL_PASSWORD_SIGN_IN_METHOD = "password";
Vr.EMAIL_LINK_SIGN_IN_METHOD = "emailLink";
class zh {
  /**
   * Constructor for generic OAuth providers.
   *
   * @param providerId - Provider for which credentials should be generated.
   */
  constructor(e) {
    this.providerId = e, this.defaultLanguageCode = null, this.customParameters = {};
  }
  /**
   * Set the language gode.
   *
   * @param languageCode - language code
   */
  setDefaultLanguage(e) {
    this.defaultLanguageCode = e;
  }
  /**
   * Sets the OAuth custom parameters to pass in an OAuth request for popup and redirect sign-in
   * operations.
   *
   * @remarks
   * For a detailed list, check the reserved required OAuth 2.0 parameters such as `client_id`,
   * `redirect_uri`, `scope`, `response_type`, and `state` are not allowed and will be ignored.
   *
   * @param customOAuthParameters - The custom OAuth parameters to pass in the OAuth request.
   */
  setCustomParameters(e) {
    return this.customParameters = e, this;
  }
  /**
   * Retrieve the current list of {@link CustomParameters}.
   */
  getCustomParameters() {
    return this.customParameters;
  }
}
class $s extends zh {
  constructor() {
    super(...arguments), this.scopes = [];
  }
  /**
   * Add an OAuth scope to the credential.
   *
   * @param scope - Provider OAuth scope to add.
   */
  addScope(e) {
    return this.scopes.includes(e) || this.scopes.push(e), this;
  }
  /**
   * Retrieve the current list of OAuth scopes.
   */
  getScopes() {
    return [...this.scopes];
  }
}
class un extends $s {
  constructor() {
    super(
      "facebook.com"
      /* ProviderId.FACEBOOK */
    );
  }
  /**
   * Creates a credential for Facebook.
   *
   * @example
   * ```javascript
   * // `event` from the Facebook auth.authResponseChange callback.
   * const credential = FacebookAuthProvider.credential(event.authResponse.accessToken);
   * const result = await signInWithCredential(credential);
   * ```
   *
   * @param accessToken - Facebook access token.
   */
  static credential(e) {
    return Zn._fromParams({
      providerId: un.PROVIDER_ID,
      signInMethod: un.FACEBOOK_SIGN_IN_METHOD,
      accessToken: e
    });
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromResult(e) {
    return un.credentialFromTaggedObject(e);
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
   * thrown during a sign-in, link, or reauthenticate operation.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromError(e) {
    return un.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e || !("oauthAccessToken" in e) || !e.oauthAccessToken)
      return null;
    try {
      return un.credential(e.oauthAccessToken);
    } catch {
      return null;
    }
  }
}
un.FACEBOOK_SIGN_IN_METHOD = "facebook.com";
un.PROVIDER_ID = "facebook.com";
class cn extends $s {
  constructor() {
    super(
      "google.com"
      /* ProviderId.GOOGLE */
    ), this.addScope("profile");
  }
  /**
   * Creates a credential for Google. At least one of ID token and access token is required.
   *
   * @example
   * ```javascript
   * // \`googleUser\` from the onsuccess Google Sign In callback.
   * const credential = GoogleAuthProvider.credential(googleUser.getAuthResponse().id_token);
   * const result = await signInWithCredential(credential);
   * ```
   *
   * @param idToken - Google ID token.
   * @param accessToken - Google access token.
   */
  static credential(e, t) {
    return Zn._fromParams({
      providerId: cn.PROVIDER_ID,
      signInMethod: cn.GOOGLE_SIGN_IN_METHOD,
      idToken: e,
      accessToken: t
    });
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromResult(e) {
    return cn.credentialFromTaggedObject(e);
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
   * thrown during a sign-in, link, or reauthenticate operation.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromError(e) {
    return cn.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e)
      return null;
    const { oauthIdToken: t, oauthAccessToken: n } = e;
    if (!t && !n)
      return null;
    try {
      return cn.credential(t, n);
    } catch {
      return null;
    }
  }
}
cn.GOOGLE_SIGN_IN_METHOD = "google.com";
cn.PROVIDER_ID = "google.com";
class ln extends $s {
  constructor() {
    super(
      "github.com"
      /* ProviderId.GITHUB */
    );
  }
  /**
   * Creates a credential for GitHub.
   *
   * @param accessToken - GitHub access token.
   */
  static credential(e) {
    return Zn._fromParams({
      providerId: ln.PROVIDER_ID,
      signInMethod: ln.GITHUB_SIGN_IN_METHOD,
      accessToken: e
    });
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromResult(e) {
    return ln.credentialFromTaggedObject(e);
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
   * thrown during a sign-in, link, or reauthenticate operation.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromError(e) {
    return ln.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e || !("oauthAccessToken" in e) || !e.oauthAccessToken)
      return null;
    try {
      return ln.credential(e.oauthAccessToken);
    } catch {
      return null;
    }
  }
}
ln.GITHUB_SIGN_IN_METHOD = "github.com";
ln.PROVIDER_ID = "github.com";
class hn extends $s {
  constructor() {
    super(
      "twitter.com"
      /* ProviderId.TWITTER */
    );
  }
  /**
   * Creates a credential for Twitter.
   *
   * @param token - Twitter access token.
   * @param secret - Twitter secret.
   */
  static credential(e, t) {
    return Zn._fromParams({
      providerId: hn.PROVIDER_ID,
      signInMethod: hn.TWITTER_SIGN_IN_METHOD,
      oauthToken: e,
      oauthTokenSecret: t
    });
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromResult(e) {
    return hn.credentialFromTaggedObject(e);
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
   * thrown during a sign-in, link, or reauthenticate operation.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromError(e) {
    return hn.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e)
      return null;
    const { oauthAccessToken: t, oauthTokenSecret: n } = e;
    if (!t || !n)
      return null;
    try {
      return hn.credential(t, n);
    } catch {
      return null;
    }
  }
}
hn.TWITTER_SIGN_IN_METHOD = "twitter.com";
hn.PROVIDER_ID = "twitter.com";
class Ar {
  constructor(e) {
    this.user = e.user, this.providerId = e.providerId, this._tokenResponse = e._tokenResponse, this.operationType = e.operationType;
  }
  static async _fromIdTokenResponse(e, t, n, s = !1) {
    const i = await wt._fromIdTokenResponse(e, n, s), o = Nc(n);
    return new Ar({
      user: i,
      providerId: o,
      _tokenResponse: n,
      operationType: t
    });
  }
  static async _forOperation(e, t, n) {
    await e._updateTokensIfNecessary(
      n,
      /* reload */
      !0
    );
    const s = Nc(n);
    return new Ar({
      user: e,
      providerId: s,
      _tokenResponse: n,
      operationType: t
    });
  }
}
function Nc(r) {
  return r.providerId ? r.providerId : "phoneNumber" in r ? "phone" : null;
}
class Zi extends $t {
  constructor(e, t, n, s) {
    super(t.code, t.message), this.operationType = n, this.user = s, Object.setPrototypeOf(this, Zi.prototype), this.customData = {
      appName: e.name,
      tenantId: e.tenantId ?? void 0,
      _serverResponse: t.customData._serverResponse,
      operationType: n
    };
  }
  static _fromErrorAndOperation(e, t, n, s) {
    return new Zi(e, t, n, s);
  }
}
function Qh(r, e, t, n) {
  return (e === "reauthenticate" ? t._getReauthenticationResolver(r) : t._getIdTokenResponse(r)).catch((i) => {
    throw i.code === "auth/multi-factor-auth-required" ? Zi._fromErrorAndOperation(r, i, e, n) : i;
  });
}
async function gm(r, e, t = !1) {
  const n = await Rs(r, e._linkToIdToken(r.auth, await r.getIdToken()), t);
  return Ar._forOperation(r, "link", n);
}
async function mm(r, e, t = !1) {
  const { auth: n } = r;
  if (It(n.app))
    return Promise.reject(gn(n));
  const s = "reauthenticate";
  try {
    const i = await Rs(r, Qh(n, s, e, r), t);
    te(
      i.idToken,
      n,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const o = cB(i.idToken);
    te(
      o,
      n,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const { sub: B } = o;
    return te(
      r.uid === B,
      n,
      "user-mismatch"
      /* AuthErrorCode.USER_MISMATCH */
    ), Ar._forOperation(r, s, i);
  } catch (i) {
    throw i?.code === "auth/user-not-found" && yt(
      n,
      "user-mismatch"
      /* AuthErrorCode.USER_MISMATCH */
    ), i;
  }
}
async function Wh(r, e, t = !1) {
  if (It(r.app))
    return Promise.reject(gn(r));
  const n = "signIn", s = await Qh(r, n, e), i = await Ar._fromIdTokenResponse(r, n, s);
  return t || await r._updateCurrentUser(i.user), i;
}
async function Em(r, e) {
  return Wh(kr(r), e);
}
async function _m(r) {
  const e = kr(r);
  e._getPasswordPolicyInternal() && await e._updatePasswordPolicy();
}
function cT(r, e, t) {
  return It(r.app) ? Promise.reject(gn(r)) : Em(Re(r), Vr.credential(e, t)).catch(async (n) => {
    throw n.code === "auth/password-does-not-meet-requirements" && _m(r), n;
  });
}
function Dm(r, e, t, n) {
  return Re(r).onIdTokenChanged(e, t, n);
}
function Im(r, e, t) {
  return Re(r).beforeAuthStateChanged(e, t);
}
function lT(r, e, t, n) {
  return Re(r).onAuthStateChanged(e, t, n);
}
function hT(r) {
  return Re(r).signOut();
}
const eo = "__sak";
class $h {
  constructor(e, t) {
    this.storageRetriever = e, this.type = t;
  }
  _isAvailable() {
    try {
      return this.storage ? (this.storage.setItem(eo, "1"), this.storage.removeItem(eo), Promise.resolve(!0)) : Promise.resolve(!1);
    } catch {
      return Promise.resolve(!1);
    }
  }
  _set(e, t) {
    return this.storage.setItem(e, JSON.stringify(t)), Promise.resolve();
  }
  _get(e) {
    const t = this.storage.getItem(e);
    return Promise.resolve(t ? JSON.parse(t) : null);
  }
  _remove(e) {
    return this.storage.removeItem(e), Promise.resolve();
  }
  get storage() {
    return this.storageRetriever();
  }
}
const wm = 1e3, ym = 10;
class Yh extends $h {
  constructor() {
    super(
      () => window.localStorage,
      "LOCAL"
      /* PersistenceType.LOCAL */
    ), this.boundEventHandler = (e, t) => this.onStorageEvent(e, t), this.listeners = {}, this.localCache = {}, this.pollTimer = null, this.fallbackToPolling = Uh(), this._shouldAllowMigration = !0;
  }
  forAllChangedKeys(e) {
    for (const t of Object.keys(this.listeners)) {
      const n = this.storage.getItem(t), s = this.localCache[t];
      n !== s && e(t, s, n);
    }
  }
  onStorageEvent(e, t = !1) {
    if (!e.key) {
      this.forAllChangedKeys((o, B, u) => {
        this.notifyListeners(o, u);
      });
      return;
    }
    const n = e.key;
    t ? this.detachListener() : this.stopPolling();
    const s = () => {
      const o = this.storage.getItem(n);
      !t && this.localCache[n] === o || this.notifyListeners(n, o);
    }, i = this.storage.getItem(n);
    Kg() && i !== e.newValue && e.newValue !== e.oldValue ? setTimeout(s, ym) : s();
  }
  notifyListeners(e, t) {
    this.localCache[e] = t;
    const n = this.listeners[e];
    if (n)
      for (const s of Array.from(n))
        s(t && JSON.parse(t));
  }
  startPolling() {
    this.stopPolling(), this.pollTimer = setInterval(() => {
      this.forAllChangedKeys((e, t, n) => {
        this.onStorageEvent(
          new StorageEvent("storage", {
            key: e,
            oldValue: t,
            newValue: n
          }),
          /* poll */
          !0
        );
      });
    }, wm);
  }
  stopPolling() {
    this.pollTimer && (clearInterval(this.pollTimer), this.pollTimer = null);
  }
  attachListener() {
    window.addEventListener("storage", this.boundEventHandler);
  }
  detachListener() {
    window.removeEventListener("storage", this.boundEventHandler);
  }
  _addListener(e, t) {
    Object.keys(this.listeners).length === 0 && (this.fallbackToPolling ? this.startPolling() : this.attachListener()), this.listeners[e] || (this.listeners[e] = /* @__PURE__ */ new Set(), this.localCache[e] = this.storage.getItem(e)), this.listeners[e].add(t);
  }
  _removeListener(e, t) {
    this.listeners[e] && (this.listeners[e].delete(t), this.listeners[e].size === 0 && delete this.listeners[e]), Object.keys(this.listeners).length === 0 && (this.detachListener(), this.stopPolling());
  }
  // Update local cache on base operations:
  async _set(e, t) {
    await super._set(e, t), this.localCache[e] = JSON.stringify(t);
  }
  async _get(e) {
    const t = await super._get(e);
    return this.localCache[e] = JSON.stringify(t), t;
  }
  async _remove(e) {
    await super._remove(e), delete this.localCache[e];
  }
}
Yh.type = "LOCAL";
const Tm = Yh;
class Xh extends $h {
  constructor() {
    super(
      () => window.sessionStorage,
      "SESSION"
      /* PersistenceType.SESSION */
    );
  }
  _addListener(e, t) {
  }
  _removeListener(e, t) {
  }
}
Xh.type = "SESSION";
const Zh = Xh;
function Am(r) {
  return Promise.all(r.map(async (e) => {
    try {
      return {
        fulfilled: !0,
        value: await e
      };
    } catch (t) {
      return {
        fulfilled: !1,
        reason: t
      };
    }
  }));
}
class Io {
  constructor(e) {
    this.eventTarget = e, this.handlersMap = {}, this.boundEventHandler = this.handleEvent.bind(this);
  }
  /**
   * Obtain an instance of a Receiver for a given event target, if none exists it will be created.
   *
   * @param eventTarget - An event target (such as window or self) through which the underlying
   * messages will be received.
   */
  static _getInstance(e) {
    const t = this.receivers.find((s) => s.isListeningto(e));
    if (t)
      return t;
    const n = new Io(e);
    return this.receivers.push(n), n;
  }
  isListeningto(e) {
    return this.eventTarget === e;
  }
  /**
   * Fans out a MessageEvent to the appropriate listeners.
   *
   * @remarks
   * Sends an {@link Status.ACK} upon receipt and a {@link Status.DONE} once all handlers have
   * finished processing.
   *
   * @param event - The MessageEvent.
   *
   */
  async handleEvent(e) {
    const t = e, { eventId: n, eventType: s, data: i } = t.data, o = this.handlersMap[s];
    if (!o?.size)
      return;
    t.ports[0].postMessage({
      status: "ack",
      eventId: n,
      eventType: s
    });
    const B = Array.from(o).map(async (c) => c(t.origin, i)), u = await Am(B);
    t.ports[0].postMessage({
      status: "done",
      eventId: n,
      eventType: s,
      response: u
    });
  }
  /**
   * Subscribe an event handler for a particular event.
   *
   * @param eventType - Event name to subscribe to.
   * @param eventHandler - The event handler which should receive the events.
   *
   */
  _subscribe(e, t) {
    Object.keys(this.handlersMap).length === 0 && this.eventTarget.addEventListener("message", this.boundEventHandler), this.handlersMap[e] || (this.handlersMap[e] = /* @__PURE__ */ new Set()), this.handlersMap[e].add(t);
  }
  /**
   * Unsubscribe an event handler from a particular event.
   *
   * @param eventType - Event name to unsubscribe from.
   * @param eventHandler - Optional event handler, if none provided, unsubscribe all handlers on this event.
   *
   */
  _unsubscribe(e, t) {
    this.handlersMap[e] && t && this.handlersMap[e].delete(t), (!t || this.handlersMap[e].size === 0) && delete this.handlersMap[e], Object.keys(this.handlersMap).length === 0 && this.eventTarget.removeEventListener("message", this.boundEventHandler);
  }
}
Io.receivers = [];
function fB(r = "", e = 10) {
  let t = "";
  for (let n = 0; n < e; n++)
    t += Math.floor(Math.random() * 10);
  return r + t;
}
class Rm {
  constructor(e) {
    this.target = e, this.handlers = /* @__PURE__ */ new Set();
  }
  /**
   * Unsubscribe the handler and remove it from our tracking Set.
   *
   * @param handler - The handler to unsubscribe.
   */
  removeMessageHandler(e) {
    e.messageChannel && (e.messageChannel.port1.removeEventListener("message", e.onMessage), e.messageChannel.port1.close()), this.handlers.delete(e);
  }
  /**
   * Send a message to the Receiver located at {@link target}.
   *
   * @remarks
   * We'll first wait a bit for an ACK , if we get one we will wait significantly longer until the
   * receiver has had a chance to fully process the event.
   *
   * @param eventType - Type of event to send.
   * @param data - The payload of the event.
   * @param timeout - Timeout for waiting on an ACK from the receiver.
   *
   * @returns An array of settled promises from all the handlers that were listening on the receiver.
   */
  async _send(e, t, n = 50) {
    const s = typeof MessageChannel < "u" ? new MessageChannel() : null;
    if (!s)
      throw new Error(
        "connection_unavailable"
        /* _MessageError.CONNECTION_UNAVAILABLE */
      );
    let i, o;
    return new Promise((B, u) => {
      const c = fB("", 20);
      s.port1.start();
      const C = setTimeout(() => {
        u(new Error(
          "unsupported_event"
          /* _MessageError.UNSUPPORTED_EVENT */
        ));
      }, n);
      o = {
        messageChannel: s,
        onMessage(f) {
          const m = f;
          if (m.data.eventId === c)
            switch (m.data.status) {
              case "ack":
                clearTimeout(C), i = setTimeout(
                  () => {
                    u(new Error(
                      "timeout"
                      /* _MessageError.TIMEOUT */
                    ));
                  },
                  3e3
                  /* _TimeoutDuration.COMPLETION */
                );
                break;
              case "done":
                clearTimeout(i), B(m.data.response);
                break;
              default:
                clearTimeout(C), clearTimeout(i), u(new Error(
                  "invalid_response"
                  /* _MessageError.INVALID_RESPONSE */
                ));
                break;
            }
        }
      }, this.handlers.add(o), s.port1.addEventListener("message", o.onMessage), this.target.postMessage({
        eventType: e,
        eventId: c,
        data: t
      }, [s.port2]);
    }).finally(() => {
      o && this.removeMessageHandler(o);
    });
  }
}
function Nt() {
  return window;
}
function vm(r) {
  Nt().location.href = r;
}
function eC() {
  return typeof Nt().WorkerGlobalScope < "u" && typeof Nt().importScripts == "function";
}
async function Pm() {
  if (!navigator?.serviceWorker)
    return null;
  try {
    return (await navigator.serviceWorker.ready).active;
  } catch {
    return null;
  }
}
function Sm() {
  return navigator?.serviceWorker?.controller || null;
}
function Om() {
  return eC() ? self : null;
}
const tC = "firebaseLocalStorageDb", bm = 1, to = "firebaseLocalStorage", nC = "fbase_key";
class Ys {
  constructor(e) {
    this.request = e;
  }
  toPromise() {
    return new Promise((e, t) => {
      this.request.addEventListener("success", () => {
        e(this.request.result);
      }), this.request.addEventListener("error", () => {
        t(this.request.error);
      });
    });
  }
}
function wo(r, e) {
  return r.transaction([to], e ? "readwrite" : "readonly").objectStore(to);
}
function Nm() {
  const r = indexedDB.deleteDatabase(tC);
  return new Ys(r).toPromise();
}
function rC() {
  const r = indexedDB.open(tC, bm);
  return new Promise((e, t) => {
    r.addEventListener("error", () => {
      t(r.error);
    }), r.addEventListener("upgradeneeded", () => {
      const n = r.result;
      try {
        n.createObjectStore(to, { keyPath: nC });
      } catch (s) {
        t(s);
      }
    }), r.addEventListener("success", async () => {
      const n = r.result;
      n.objectStoreNames.contains(to) ? e(n) : (n.close(), await Nm(), e(await rC()));
    });
  });
}
async function Fc(r, e, t) {
  const n = wo(r, !0).put({
    [nC]: e,
    value: t
  });
  return new Ys(n).toPromise();
}
async function Fm(r, e) {
  const t = wo(r, !1).get(e), n = await new Ys(t).toPromise();
  return n === void 0 ? null : n.value;
}
function Lc(r, e) {
  const t = wo(r, !0).delete(e);
  return new Ys(t).toPromise();
}
const Lm = 800, km = 3;
class sC {
  registerLifecycleListeners() {
    typeof window < "u" && typeof window.addEventListener == "function" && (window.addEventListener("pagehide", this.onPageHide), window.addEventListener("pageshow", this.onPageShow));
  }
  unregisterLifecycleListeners() {
    typeof window < "u" && typeof window.removeEventListener == "function" && (window.removeEventListener("pagehide", this.onPageHide), window.removeEventListener("pageshow", this.onPageShow));
  }
  constructor() {
    this.type = "LOCAL", this.dbPromise = null, this._shouldAllowMigration = !0, this.listeners = {}, this.localCache = {}, this.pollTimer = null, this.isClosing = !1, this.pendingWrites = 0, this.receiver = null, this.sender = null, this.serviceWorkerReceiverAvailable = !1, this.activeServiceWorker = null, this.onPageHide = () => {
      this.isClosing = !0, this.stopPolling(), this.dbPromise && (this.dbPromise.then((e) => e.close()).catch(() => {
      }), this.dbPromise = null);
    }, this.onPageShow = () => {
      this.isClosing && (this.isClosing = !1, Object.keys(this.listeners).length > 0 && this.startPolling());
    }, this._workerInitializationPromise = this.initializeServiceWorkerMessaging().then(() => {
    }, () => {
    });
  }
  async _openDb() {
    if (this.isClosing)
      throw new Error("Database is closing");
    return this.dbPromise ? this.dbPromise : (this.dbPromise = rC(), this.dbPromise.catch(() => {
      this.dbPromise = null;
    }), this.dbPromise);
  }
  async _withRetries(e) {
    let t = 0;
    for (; ; )
      try {
        const n = await this._openDb();
        return await e(n);
      } catch (n) {
        if (this.isClosing || t++ > km)
          throw n;
        this.dbPromise && ((await this.dbPromise).close(), this.dbPromise = null);
      }
  }
  /**
   * IndexedDB events do not propagate from the main window to the worker context.  We rely on a
   * postMessage interface to send these events to the worker ourselves.
   */
  async initializeServiceWorkerMessaging() {
    return eC() ? this.initializeReceiver() : this.initializeSender();
  }
  /**
   * As the worker we should listen to events from the main window.
   */
  async initializeReceiver() {
    this.receiver = Io._getInstance(Om()), this.receiver._subscribe("keyChanged", async (e, t) => ({
      keyProcessed: (await this._poll()).includes(t.key)
    })), this.receiver._subscribe("ping", async (e, t) => [
      "keyChanged"
      /* _EventType.KEY_CHANGED */
    ]);
  }
  /**
   * As the main window, we should let the worker know when keys change (set and remove).
   *
   * @remarks
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/ready | ServiceWorkerContainer.ready}
   * may not resolve.
   */
  async initializeSender() {
    if (this.activeServiceWorker = await Pm(), !this.activeServiceWorker)
      return;
    this.sender = new Rm(this.activeServiceWorker);
    const e = await this.sender._send(
      "ping",
      {},
      800
      /* _TimeoutDuration.LONG_ACK */
    );
    e && e[0]?.fulfilled && e[0]?.value.includes(
      "keyChanged"
      /* _EventType.KEY_CHANGED */
    ) && (this.serviceWorkerReceiverAvailable = !0);
  }
  /**
   * Let the worker know about a changed key, the exact key doesn't technically matter since the
   * worker will just trigger a full sync anyway.
   *
   * @remarks
   * For now, we only support one service worker per page.
   *
   * @param key - Storage key which changed.
   */
  async notifyServiceWorker(e) {
    if (!(!this.sender || !this.activeServiceWorker || Sm() !== this.activeServiceWorker))
      try {
        await this.sender._send(
          "keyChanged",
          { key: e },
          // Use long timeout if receiver has previously responded to a ping from us.
          this.serviceWorkerReceiverAvailable ? 800 : 50
          /* _TimeoutDuration.ACK */
        );
      } catch {
      }
  }
  async _isAvailable() {
    try {
      return indexedDB ? (await this._withRetries(async (e) => {
        await Fc(e, eo, "1"), await Lc(e, eo);
      }), !0) : !1;
    } catch {
    }
    return !1;
  }
  async _withPendingWrite(e) {
    this.pendingWrites++;
    try {
      await e();
    } finally {
      this.pendingWrites--;
    }
  }
  async _set(e, t) {
    return this._withPendingWrite(async () => (await this._withRetries((n) => Fc(n, e, t)), this.localCache[e] = t, this.notifyServiceWorker(e)));
  }
  async _get(e) {
    const t = await this._withRetries((n) => Fm(n, e));
    return this.localCache[e] = t, t;
  }
  async _remove(e) {
    return this._withPendingWrite(async () => (await this._withRetries((t) => Lc(t, e)), delete this.localCache[e], this.notifyServiceWorker(e)));
  }
  async _poll() {
    if (this.isClosing)
      return [];
    try {
      const e = await this._withRetries((s) => {
        const i = wo(s, !1).getAll();
        return new Ys(i).toPromise();
      });
      if (this.isClosing)
        return [];
      if (!e)
        return [];
      if (this.pendingWrites !== 0)
        return [];
      const t = [], n = /* @__PURE__ */ new Set();
      if (e.length !== 0)
        for (const { fbase_key: s, value: i } of e)
          n.add(s), JSON.stringify(this.localCache[s]) !== JSON.stringify(i) && (this.notifyListeners(s, i), t.push(s));
      for (const s of Object.keys(this.localCache))
        this.localCache[s] && !n.has(s) && (this.notifyListeners(s, null), t.push(s));
      return t;
    } catch (e) {
      return this.isClosing || vh(`Firebase Auth cross-tab polling failed with error: ${e}`), [];
    }
  }
  notifyListeners(e, t) {
    this.localCache[e] = t;
    const n = this.listeners[e];
    if (n)
      for (const s of Array.from(n))
        s(t);
  }
  startPolling() {
    this.stopPolling(), this.pollTimer = setInterval(async () => this._poll(), Lm);
  }
  stopPolling() {
    this.pollTimer && (clearInterval(this.pollTimer), this.pollTimer = null);
  }
  _addListener(e, t) {
    Object.keys(this.listeners).length === 0 && (this.startPolling(), this.registerLifecycleListeners()), this.listeners[e] || (this.listeners[e] = /* @__PURE__ */ new Set(), this._get(e)), this.listeners[e].add(t);
  }
  _removeListener(e, t) {
    this.listeners[e] && (this.listeners[e].delete(t), this.listeners[e].size === 0 && delete this.listeners[e]), Object.keys(this.listeners).length === 0 && (this.stopPolling(), this.unregisterLifecycleListeners());
  }
}
sC.type = "LOCAL";
const Vm = sC;
new Ws(3e4, 6e4);
function xm(r, e) {
  return e ? Ut(e) : (te(
    r._popupRedirectResolver,
    r,
    "argument-error"
    /* AuthErrorCode.ARGUMENT_ERROR */
  ), r._popupRedirectResolver);
}
class dB extends hB {
  constructor(e) {
    super(
      "custom",
      "custom"
      /* ProviderId.CUSTOM */
    ), this.params = e;
  }
  _getIdTokenResponse(e) {
    return Ir(e, this._buildIdpRequest());
  }
  _linkToIdToken(e, t) {
    return Ir(e, this._buildIdpRequest(t));
  }
  _getReauthenticationResolver(e) {
    return Ir(e, this._buildIdpRequest());
  }
  _buildIdpRequest(e) {
    const t = {
      requestUri: this.params.requestUri,
      sessionId: this.params.sessionId,
      postBody: this.params.postBody,
      tenantId: this.params.tenantId,
      pendingToken: this.params.pendingToken,
      returnSecureToken: !0,
      returnIdpCredential: !0
    };
    return e && (t.idToken = e), t;
  }
}
function Mm(r) {
  return Wh(r.auth, new dB(r), r.bypassAuthState);
}
function Gm(r) {
  const { auth: e, user: t } = r;
  return te(
    t,
    e,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), mm(t, new dB(r), r.bypassAuthState);
}
async function Hm(r) {
  const { auth: e, user: t } = r;
  return te(
    t,
    e,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), gm(t, new dB(r), r.bypassAuthState);
}
class iC {
  constructor(e, t, n, s, i = !1) {
    this.auth = e, this.resolver = n, this.user = s, this.bypassAuthState = i, this.pendingPromise = null, this.eventManager = null, this.filter = Array.isArray(t) ? t : [t];
  }
  execute() {
    return new Promise(async (e, t) => {
      this.pendingPromise = { resolve: e, reject: t };
      try {
        this.eventManager = await this.resolver._initialize(this.auth), await this.onExecution(), this.eventManager.registerConsumer(this);
      } catch (n) {
        this.reject(n);
      }
    });
  }
  async onAuthEvent(e) {
    const { urlResponse: t, sessionId: n, postBody: s, tenantId: i, error: o, type: B } = e;
    if (o) {
      this.reject(o);
      return;
    }
    const u = {
      auth: this.auth,
      requestUri: t,
      sessionId: n,
      tenantId: i || void 0,
      postBody: s || void 0,
      user: this.user,
      bypassAuthState: this.bypassAuthState
    };
    try {
      this.resolve(await this.getIdpTask(B)(u));
    } catch (c) {
      this.reject(c);
    }
  }
  onError(e) {
    this.reject(e);
  }
  getIdpTask(e) {
    switch (e) {
      case "signInViaPopup":
      case "signInViaRedirect":
        return Mm;
      case "linkViaPopup":
      case "linkViaRedirect":
        return Hm;
      case "reauthViaPopup":
      case "reauthViaRedirect":
        return Gm;
      default:
        yt(
          this.auth,
          "internal-error"
          /* AuthErrorCode.INTERNAL_ERROR */
        );
    }
  }
  resolve(e) {
    zt(this.pendingPromise, "Pending promise was never set"), this.pendingPromise.resolve(e), this.unregisterAndCleanUp();
  }
  reject(e) {
    zt(this.pendingPromise, "Pending promise was never set"), this.pendingPromise.reject(e), this.unregisterAndCleanUp();
  }
  unregisterAndCleanUp() {
    this.eventManager && this.eventManager.unregisterConsumer(this), this.pendingPromise = null, this.cleanUp();
  }
}
const Um = new Ws(2e3, 1e4);
class mr extends iC {
  constructor(e, t, n, s, i) {
    super(e, t, s, i), this.provider = n, this.authWindow = null, this.pollId = null, mr.currentPopupAction && mr.currentPopupAction.cancel(), mr.currentPopupAction = this;
  }
  async executeNotNull() {
    const e = await this.execute();
    return te(
      e,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), e;
  }
  async onExecution() {
    zt(this.filter.length === 1, "Popup operations only handle one event");
    const e = fB();
    this.authWindow = await this.resolver._openPopup(
      this.auth,
      this.provider,
      this.filter[0],
      // There's always one, see constructor
      e
    ), this.authWindow.associatedEvent = e, this.resolver._originValidation(this.auth).catch((t) => {
      this.reject(t);
    }), this.resolver._isIframeWebStorageSupported(this.auth, (t) => {
      t || this.reject(bt(
        this.auth,
        "web-storage-unsupported"
        /* AuthErrorCode.WEB_STORAGE_UNSUPPORTED */
      ));
    }), this.pollUserCancellation();
  }
  get eventId() {
    return this.authWindow?.associatedEvent || null;
  }
  cancel() {
    this.reject(bt(
      this.auth,
      "cancelled-popup-request"
      /* AuthErrorCode.EXPIRED_POPUP_REQUEST */
    ));
  }
  cleanUp() {
    this.authWindow && this.authWindow.close(), this.pollId && window.clearTimeout(this.pollId), this.authWindow = null, this.pollId = null, mr.currentPopupAction = null;
  }
  pollUserCancellation() {
    const e = () => {
      if (this.authWindow?.window?.closed) {
        this.pollId = window.setTimeout(
          () => {
            this.pollId = null, this.reject(bt(
              this.auth,
              "popup-closed-by-user"
              /* AuthErrorCode.POPUP_CLOSED_BY_USER */
            ));
          },
          8e3
          /* _Timeout.AUTH_EVENT */
        );
        return;
      }
      this.pollId = window.setTimeout(e, Um.get());
    };
    e();
  }
}
mr.currentPopupAction = null;
const Jm = "pendingRedirect", Hi = /* @__PURE__ */ new Map();
class jm extends iC {
  constructor(e, t, n = !1) {
    super(e, [
      "signInViaRedirect",
      "linkViaRedirect",
      "reauthViaRedirect",
      "unknown"
      /* AuthEventType.UNKNOWN */
    ], t, void 0, n), this.eventId = null;
  }
  /**
   * Override the execute function; if we already have a redirect result, then
   * just return it.
   */
  async execute() {
    let e = Hi.get(this.auth._key());
    if (!e) {
      try {
        const n = await qm(this.resolver, this.auth) ? await super.execute() : null;
        e = () => Promise.resolve(n);
      } catch (t) {
        e = () => Promise.reject(t);
      }
      Hi.set(this.auth._key(), e);
    }
    return this.bypassAuthState || Hi.set(this.auth._key(), () => Promise.resolve(null)), e();
  }
  async onAuthEvent(e) {
    if (e.type === "signInViaRedirect")
      return super.onAuthEvent(e);
    if (e.type === "unknown") {
      this.resolve(null);
      return;
    }
    if (e.eventId) {
      const t = await this.auth._redirectUserForId(e.eventId);
      if (t)
        return this.user = t, super.onAuthEvent(e);
      this.resolve(null);
    }
  }
  async onExecution() {
  }
  cleanUp() {
  }
}
async function qm(r, e) {
  const t = Qm(e), n = zm(r);
  if (!await n._isAvailable())
    return !1;
  const s = await n._get(t) === "true";
  return await n._remove(t), s;
}
function Km(r, e) {
  Hi.set(r._key(), e);
}
function zm(r) {
  return Ut(r._redirectPersistence);
}
function Qm(r) {
  return Gi(Jm, r.config.apiKey, r.name);
}
async function Wm(r, e, t = !1) {
  if (It(r.app))
    return Promise.reject(gn(r));
  const n = kr(r), s = xm(n, e), o = await new jm(n, s, t).execute();
  return o && !t && (delete o.user._redirectEventId, await n._persistUserIfCurrent(o.user), await n._setRedirectUser(null, e)), o;
}
const $m = 600 * 1e3;
class Ym {
  constructor(e) {
    this.auth = e, this.cachedEventUids = /* @__PURE__ */ new Set(), this.consumers = /* @__PURE__ */ new Set(), this.queuedRedirectEvent = null, this.hasHandledPotentialRedirect = !1, this.lastProcessedEventTime = Date.now();
  }
  registerConsumer(e) {
    this.consumers.add(e), this.queuedRedirectEvent && this.isEventForConsumer(this.queuedRedirectEvent, e) && (this.sendToConsumer(this.queuedRedirectEvent, e), this.saveEventToCache(this.queuedRedirectEvent), this.queuedRedirectEvent = null);
  }
  unregisterConsumer(e) {
    this.consumers.delete(e);
  }
  onEvent(e) {
    if (this.hasEventBeenHandled(e))
      return !1;
    let t = !1;
    return this.consumers.forEach((n) => {
      this.isEventForConsumer(e, n) && (t = !0, this.sendToConsumer(e, n), this.saveEventToCache(e));
    }), this.hasHandledPotentialRedirect || !Xm(e) || (this.hasHandledPotentialRedirect = !0, t || (this.queuedRedirectEvent = e, t = !0)), t;
  }
  sendToConsumer(e, t) {
    if (e.error && !oC(e)) {
      const n = e.error.code?.split("auth/")[1] || "internal-error";
      t.onError(bt(this.auth, n));
    } else
      t.onAuthEvent(e);
  }
  isEventForConsumer(e, t) {
    const n = t.eventId === null || !!e.eventId && e.eventId === t.eventId;
    return t.filter.includes(e.type) && n;
  }
  hasEventBeenHandled(e) {
    return Date.now() - this.lastProcessedEventTime >= $m && this.cachedEventUids.clear(), this.cachedEventUids.has(kc(e));
  }
  saveEventToCache(e) {
    this.cachedEventUids.add(kc(e)), this.lastProcessedEventTime = Date.now();
  }
}
function kc(r) {
  return [r.type, r.eventId, r.sessionId, r.tenantId].filter((e) => e).join("-");
}
function oC({ type: r, error: e }) {
  return r === "unknown" && e?.code === "auth/no-auth-event";
}
function Xm(r) {
  switch (r.type) {
    case "signInViaRedirect":
    case "linkViaRedirect":
    case "reauthViaRedirect":
      return !0;
    case "unknown":
      return oC(r);
    default:
      return !1;
  }
}
async function Zm(r, e = {}) {
  return Fn(r, "GET", "/v1/projects", e);
}
const eE = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, tE = /^https?/;
async function nE(r) {
  if (r.config.emulator)
    return;
  const { authorizedDomains: e } = await Zm(r);
  for (const t of e)
    try {
      if (rE(t))
        return;
    } catch {
    }
  yt(
    r,
    "unauthorized-domain"
    /* AuthErrorCode.INVALID_ORIGIN */
  );
}
function rE(r) {
  const e = ka(), { protocol: t, hostname: n } = new URL(e);
  if (r.startsWith("chrome-extension://")) {
    const o = new URL(r);
    return o.hostname === "" && n === "" ? t === "chrome-extension:" && r.replace("chrome-extension://", "") === e.replace("chrome-extension://", "") : t === "chrome-extension:" && o.hostname === n;
  }
  if (!tE.test(t))
    return !1;
  if (eE.test(r))
    return n === r;
  const s = r.replace(/\./g, "\\.");
  return new RegExp("^(.+\\." + s + "|" + s + ")$", "i").test(n);
}
const sE = new Ws(3e4, 6e4);
function Vc() {
  const r = Nt().___jsl;
  if (r?.H) {
    for (const e of Object.keys(r.H))
      if (r.H[e].r = r.H[e].r || [], r.H[e].L = r.H[e].L || [], r.H[e].r = [...r.H[e].L], r.CP)
        for (let t = 0; t < r.CP.length; t++)
          r.CP[t] = null;
  }
}
function iE(r) {
  return new Promise((e, t) => {
    function n() {
      Vc(), gapi.load("gapi.iframes", {
        callback: () => {
          e(gapi.iframes.getContext());
        },
        ontimeout: () => {
          Vc(), t(bt(
            r,
            "network-request-failed"
            /* AuthErrorCode.NETWORK_REQUEST_FAILED */
          ));
        },
        timeout: sE.get()
      });
    }
    if (Nt().gapi?.iframes?.Iframe)
      e(gapi.iframes.getContext());
    else if (Nt().gapi?.load)
      n();
    else {
      const s = tm("iframefcb");
      return Nt()[s] = () => {
        gapi.load ? n() : t(bt(
          r,
          "network-request-failed"
          /* AuthErrorCode.NETWORK_REQUEST_FAILED */
        ));
      }, jh(`${em()}?onload=${s}`).catch((i) => t(i));
    }
  }).catch((e) => {
    throw Ui = null, e;
  });
}
let Ui = null;
function oE(r) {
  return Ui = Ui || iE(r), Ui;
}
const aE = new Ws(5e3, 15e3), BE = "__/auth/iframe", uE = "emulator/auth/iframe", cE = {
  style: {
    position: "absolute",
    top: "-100px",
    width: "1px",
    height: "1px"
  },
  "aria-hidden": "true",
  tabindex: "-1"
}, lE = /* @__PURE__ */ new Map([
  ["identitytoolkit.googleapis.com", "p"],
  // production
  ["staging-identitytoolkit.sandbox.googleapis.com", "s"],
  // staging
  ["test-identitytoolkit.sandbox.googleapis.com", "t"]
  // test
]);
function hE(r) {
  const e = r.config;
  te(
    e.authDomain,
    r,
    "auth-domain-config-required"
    /* AuthErrorCode.MISSING_AUTH_DOMAIN */
  );
  const t = e.emulator ? uB(e, uE) : `https://${r.config.authDomain}/${BE}`, n = {
    apiKey: e.apiKey,
    appName: r.name,
    v: Lr
  }, s = lE.get(r.config.apiHost);
  s && (n.eid = s);
  const i = r._getFrameworks();
  return i.length && (n.fw = i.join(",")), `${t}?${zs(n).slice(1)}`;
}
async function CE(r) {
  const e = await oE(r), t = Nt().gapi;
  return te(
    t,
    r,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), e.open({
    where: document.body,
    url: hE(r),
    messageHandlersFilter: t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,
    attributes: cE,
    dontclear: !0
  }, (n) => new Promise(async (s, i) => {
    await n.restyle({
      // Prevent iframe from closing on mouse out.
      setHideOnLeave: !1
    });
    const o = bt(
      r,
      "network-request-failed"
      /* AuthErrorCode.NETWORK_REQUEST_FAILED */
    ), B = Nt().setTimeout(() => {
      i(o);
    }, aE.get());
    function u() {
      Nt().clearTimeout(B), s(n);
    }
    n.ping(u).then(u, () => {
      i(o);
    });
  }));
}
const fE = {
  location: "yes",
  resizable: "yes",
  statusbar: "yes",
  toolbar: "no"
}, dE = 500, pE = 600, gE = "_blank", mE = "http://localhost";
class xc {
  constructor(e) {
    this.window = e, this.associatedEvent = null;
  }
  close() {
    if (this.window)
      try {
        this.window.close();
      } catch {
      }
  }
}
function EE(r, e, t, n = dE, s = pE) {
  const i = Math.max((window.screen.availHeight - s) / 2, 0).toString(), o = Math.max((window.screen.availWidth - n) / 2, 0).toString();
  let B = "";
  const u = {
    ...fE,
    width: n.toString(),
    height: s.toString(),
    top: i,
    left: o
  }, c = Qe().toLowerCase();
  t && (B = Vh(c) ? gE : t), Lh(c) && (e = e || mE, u.scrollbars = "yes");
  const C = Object.entries(u).reduce((m, [R, P]) => `${m}${R}=${P},`, "");
  if (qg(c) && B !== "_self")
    return _E(e || "", B), new xc(null);
  const f = window.open(e || "", B, C);
  te(
    f,
    r,
    "popup-blocked"
    /* AuthErrorCode.POPUP_BLOCKED */
  );
  try {
    f.focus();
  } catch {
  }
  return new xc(f);
}
function _E(r, e) {
  const t = document.createElement("a");
  t.href = r, t.target = e;
  const n = document.createEvent("MouseEvent");
  n.initMouseEvent("click", !0, !0, window, 1, 0, 0, 0, 0, !1, !1, !1, !1, 1, null), t.dispatchEvent(n);
}
const DE = "__/auth/handler", IE = "emulator/auth/handler", wE = encodeURIComponent("fac");
async function Mc(r, e, t, n, s, i) {
  te(
    r.config.authDomain,
    r,
    "auth-domain-config-required"
    /* AuthErrorCode.MISSING_AUTH_DOMAIN */
  ), te(
    r.config.apiKey,
    r,
    "invalid-api-key"
    /* AuthErrorCode.INVALID_API_KEY */
  );
  const o = {
    apiKey: r.config.apiKey,
    appName: r.name,
    authType: t,
    redirectUrl: n,
    v: Lr,
    eventId: s
  };
  if (e instanceof zh) {
    e.setDefaultLanguage(r.languageCode), o.providerId = e.providerId || "", lp(e.getCustomParameters()) || (o.customParameters = JSON.stringify(e.getCustomParameters()));
    for (const [C, f] of Object.entries({}))
      o[C] = f;
  }
  if (e instanceof $s) {
    const C = e.getScopes().filter((f) => f !== "");
    C.length > 0 && (o.scopes = C.join(","));
  }
  r.tenantId && (o.tid = r.tenantId);
  const B = o;
  for (const C of Object.keys(B))
    B[C] === void 0 && delete B[C];
  const u = await r._getAppCheckToken(), c = u ? `#${wE}=${encodeURIComponent(u)}` : "";
  return `${yE(r)}?${zs(B).slice(1)}${c}`;
}
function yE({ config: r }) {
  return r.emulator ? uB(r, IE) : `https://${r.authDomain}/${DE}`;
}
const _a = "webStorageSupport";
class TE {
  constructor() {
    this.eventManagers = {}, this.iframes = {}, this.originValidationPromises = {}, this._redirectPersistence = Zh, this._completeRedirectFn = Wm, this._overrideRedirectResult = Km;
  }
  // Wrapping in async even though we don't await anywhere in order
  // to make sure errors are raised as promise rejections
  async _openPopup(e, t, n, s) {
    zt(this.eventManagers[e._key()]?.manager, "_initialize() not called before _openPopup()");
    const i = await Mc(e, t, n, ka(), s);
    return EE(e, i, fB());
  }
  async _openRedirect(e, t, n, s) {
    await this._originValidation(e);
    const i = await Mc(e, t, n, ka(), s);
    return vm(i), new Promise(() => {
    });
  }
  _initialize(e) {
    const t = e._key();
    if (this.eventManagers[t]) {
      const { manager: s, promise: i } = this.eventManagers[t];
      return s ? Promise.resolve(s) : (zt(i, "If manager is not set, promise should be"), i);
    }
    const n = this.initAndGetManager(e);
    return this.eventManagers[t] = { promise: n }, n.catch(() => {
      delete this.eventManagers[t];
    }), n;
  }
  async initAndGetManager(e) {
    const t = await CE(e), n = new Ym(e);
    return t.register("authEvent", (s) => (te(
      s?.authEvent,
      e,
      "invalid-auth-event"
      /* AuthErrorCode.INVALID_AUTH_EVENT */
    ), {
      status: n.onEvent(s.authEvent) ? "ACK" : "ERROR"
      /* GapiOutcome.ERROR */
    }), gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER), this.eventManagers[e._key()] = { manager: n }, this.iframes[e._key()] = t, n;
  }
  _isIframeWebStorageSupported(e, t) {
    this.iframes[e._key()].send(_a, { type: _a }, (s) => {
      const i = s?.[0]?.[_a];
      i !== void 0 && t(!!i), yt(
        e,
        "internal-error"
        /* AuthErrorCode.INTERNAL_ERROR */
      );
    }, gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER);
  }
  _originValidation(e) {
    const t = e._key();
    return this.originValidationPromises[t] || (this.originValidationPromises[t] = nE(e)), this.originValidationPromises[t];
  }
  get _shouldInitProactively() {
    return Uh() || kh() || lB();
  }
}
const AE = TE;
var Gc = "@firebase/auth", Hc = "1.13.5";
class RE {
  constructor(e) {
    this.auth = e, this.internalListeners = /* @__PURE__ */ new Map();
  }
  getUid() {
    return this.assertAuthConfigured(), this.auth.currentUser?.uid || null;
  }
  async getToken(e) {
    return this.assertAuthConfigured(), await this.auth._initializationPromise, this.auth.currentUser ? { accessToken: await this.auth.currentUser.getIdToken(e) } : null;
  }
  addAuthTokenListener(e) {
    if (this.assertAuthConfigured(), this.internalListeners.has(e))
      return;
    const t = this.auth.onIdTokenChanged((n) => {
      e(n?.stsTokenManager.accessToken || null);
    });
    this.internalListeners.set(e, t), this.updateProactiveRefresh();
  }
  removeAuthTokenListener(e) {
    this.assertAuthConfigured();
    const t = this.internalListeners.get(e);
    t && (this.internalListeners.delete(e), t(), this.updateProactiveRefresh());
  }
  assertAuthConfigured() {
    te(
      this.auth._initializationPromise,
      "dependent-sdk-initialized-before-auth"
      /* AuthErrorCode.DEPENDENT_SDK_INIT_BEFORE_AUTH */
    );
  }
  updateProactiveRefresh() {
    this.internalListeners.size > 0 ? this.auth._startProactiveRefresh() : this.auth._stopProactiveRefresh();
  }
}
function vE(r) {
  switch (r) {
    case "Node":
      return "node";
    case "ReactNative":
      return "rn";
    case "Worker":
      return "webworker";
    case "Cordova":
      return "cordova";
    case "WebExtension":
      return "web-extension";
    default:
      return;
  }
}
function PE(r) {
  Tr(new Xn(
    "auth",
    (e, { options: t }) => {
      const n = e.getProvider("app").getImmediate(), s = e.getProvider("heartbeat"), i = e.getProvider("app-check-internal"), { apiKey: o, authDomain: B } = n.options;
      te(o && !o.includes(":"), "invalid-api-key", { appName: n.name });
      const u = {
        apiKey: o,
        authDomain: B,
        clientPlatform: r,
        apiHost: "identitytoolkit.googleapis.com",
        tokenApiHost: "securetoken.googleapis.com",
        apiScheme: "https",
        sdkClientVersion: Jh(r)
      }, c = new Yg(n, s, i, u);
      return om(c, t), c;
    },
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ).setInstantiationMode(
    "EXPLICIT"
    /* InstantiationMode.EXPLICIT */
  ).setInstanceCreatedCallback((e, t, n) => {
    e.getProvider(
      "auth-internal"
      /* _ComponentName.AUTH_INTERNAL */
    ).initialize();
  })), Tr(new Xn(
    "auth-internal",
    (e) => {
      const t = kr(e.getProvider(
        "auth"
        /* _ComponentName.AUTH */
      ).getImmediate());
      return ((n) => new RE(n))(t);
    },
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ).setInstantiationMode(
    "EXPLICIT"
    /* InstantiationMode.EXPLICIT */
  )), pn(Gc, Hc, vE(r)), pn(Gc, Hc, "esm2020");
}
const SE = 300, OE = mh("authIdTokenMaxAge") || SE;
let Uc = null;
const bE = (r) => async (e) => {
  const t = e && await e.getIdTokenResult(), n = t && ((/* @__PURE__ */ new Date()).getTime() - Date.parse(t.issuedAtTime)) / 1e3;
  if (n && n > OE)
    return;
  const s = t?.token;
  Uc !== s && (Uc = s, await fetch(r, {
    method: s ? "POST" : "DELETE",
    headers: s ? {
      Authorization: `Bearer ${s}`
    } : {}
  }));
};
function CT(r = wh()) {
  const e = aB(r, "auth");
  if (e.isInitialized())
    return e.getImmediate();
  const t = im(r, {
    popupRedirectResolver: AE,
    persistence: [
      Vm,
      Tm,
      Zh
    ]
  }), n = mh("authTokenSyncURL");
  if (n && typeof isSecureContext == "boolean" && isSecureContext) {
    const i = new URL(n, location.origin);
    if (location.origin === i.origin) {
      const o = bE(i.toString());
      Im(t, o, () => o(t.currentUser)), Dm(t, (B) => o(B));
    }
  }
  const s = ph("auth");
  return s && am(t, `http://${s}`), t;
}
function NE() {
  return document.getElementsByTagName("head")?.[0] ?? document;
}
Xg({
  loadJS(r) {
    return new Promise((e, t) => {
      const n = document.createElement("script");
      n.setAttribute("src", r), n.onload = e, n.onerror = (s) => {
        const i = bt(
          "internal-error"
          /* AuthErrorCode.INTERNAL_ERROR */
        );
        i.customData = s, t(i);
      }, n.type = "text/javascript", n.charset = "UTF-8", NE().appendChild(n);
    });
  },
  gapiScript: "https://apis.google.com/js/api.js",
  recaptchaV2Script: "https://www.google.com/recaptcha/api.js",
  recaptchaEnterpriseScript: "https://www.google.com/recaptcha/enterprise.js?render="
});
PE(
  "Browser"
  /* ClientPlatform.BROWSER */
);
var Jc = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
var mn, aC;
(function() {
  var r;
  function e(T, E) {
    function D() {
    }
    D.prototype = E.prototype, T.F = E.prototype, T.prototype = new D(), T.prototype.constructor = T, T.D = function(A, y, S) {
      for (var _ = Array(arguments.length - 2), et = 2; et < arguments.length; et++) _[et - 2] = arguments[et];
      return E.prototype[y].apply(A, _);
    };
  }
  function t() {
    this.blockSize = -1;
  }
  function n() {
    this.blockSize = -1, this.blockSize = 64, this.g = Array(4), this.C = Array(this.blockSize), this.o = this.h = 0, this.u();
  }
  e(n, t), n.prototype.u = function() {
    this.g[0] = 1732584193, this.g[1] = 4023233417, this.g[2] = 2562383102, this.g[3] = 271733878, this.o = this.h = 0;
  };
  function s(T, E, D) {
    D || (D = 0);
    const A = Array(16);
    if (typeof E == "string") for (var y = 0; y < 16; ++y) A[y] = E.charCodeAt(D++) | E.charCodeAt(D++) << 8 | E.charCodeAt(D++) << 16 | E.charCodeAt(D++) << 24;
    else for (y = 0; y < 16; ++y) A[y] = E[D++] | E[D++] << 8 | E[D++] << 16 | E[D++] << 24;
    E = T.g[0], D = T.g[1], y = T.g[2];
    let S = T.g[3], _;
    _ = E + (S ^ D & (y ^ S)) + A[0] + 3614090360 & 4294967295, E = D + (_ << 7 & 4294967295 | _ >>> 25), _ = S + (y ^ E & (D ^ y)) + A[1] + 3905402710 & 4294967295, S = E + (_ << 12 & 4294967295 | _ >>> 20), _ = y + (D ^ S & (E ^ D)) + A[2] + 606105819 & 4294967295, y = S + (_ << 17 & 4294967295 | _ >>> 15), _ = D + (E ^ y & (S ^ E)) + A[3] + 3250441966 & 4294967295, D = y + (_ << 22 & 4294967295 | _ >>> 10), _ = E + (S ^ D & (y ^ S)) + A[4] + 4118548399 & 4294967295, E = D + (_ << 7 & 4294967295 | _ >>> 25), _ = S + (y ^ E & (D ^ y)) + A[5] + 1200080426 & 4294967295, S = E + (_ << 12 & 4294967295 | _ >>> 20), _ = y + (D ^ S & (E ^ D)) + A[6] + 2821735955 & 4294967295, y = S + (_ << 17 & 4294967295 | _ >>> 15), _ = D + (E ^ y & (S ^ E)) + A[7] + 4249261313 & 4294967295, D = y + (_ << 22 & 4294967295 | _ >>> 10), _ = E + (S ^ D & (y ^ S)) + A[8] + 1770035416 & 4294967295, E = D + (_ << 7 & 4294967295 | _ >>> 25), _ = S + (y ^ E & (D ^ y)) + A[9] + 2336552879 & 4294967295, S = E + (_ << 12 & 4294967295 | _ >>> 20), _ = y + (D ^ S & (E ^ D)) + A[10] + 4294925233 & 4294967295, y = S + (_ << 17 & 4294967295 | _ >>> 15), _ = D + (E ^ y & (S ^ E)) + A[11] + 2304563134 & 4294967295, D = y + (_ << 22 & 4294967295 | _ >>> 10), _ = E + (S ^ D & (y ^ S)) + A[12] + 1804603682 & 4294967295, E = D + (_ << 7 & 4294967295 | _ >>> 25), _ = S + (y ^ E & (D ^ y)) + A[13] + 4254626195 & 4294967295, S = E + (_ << 12 & 4294967295 | _ >>> 20), _ = y + (D ^ S & (E ^ D)) + A[14] + 2792965006 & 4294967295, y = S + (_ << 17 & 4294967295 | _ >>> 15), _ = D + (E ^ y & (S ^ E)) + A[15] + 1236535329 & 4294967295, D = y + (_ << 22 & 4294967295 | _ >>> 10), _ = E + (y ^ S & (D ^ y)) + A[1] + 4129170786 & 4294967295, E = D + (_ << 5 & 4294967295 | _ >>> 27), _ = S + (D ^ y & (E ^ D)) + A[6] + 3225465664 & 4294967295, S = E + (_ << 9 & 4294967295 | _ >>> 23), _ = y + (E ^ D & (S ^ E)) + A[11] + 643717713 & 4294967295, y = S + (_ << 14 & 4294967295 | _ >>> 18), _ = D + (S ^ E & (y ^ S)) + A[0] + 3921069994 & 4294967295, D = y + (_ << 20 & 4294967295 | _ >>> 12), _ = E + (y ^ S & (D ^ y)) + A[5] + 3593408605 & 4294967295, E = D + (_ << 5 & 4294967295 | _ >>> 27), _ = S + (D ^ y & (E ^ D)) + A[10] + 38016083 & 4294967295, S = E + (_ << 9 & 4294967295 | _ >>> 23), _ = y + (E ^ D & (S ^ E)) + A[15] + 3634488961 & 4294967295, y = S + (_ << 14 & 4294967295 | _ >>> 18), _ = D + (S ^ E & (y ^ S)) + A[4] + 3889429448 & 4294967295, D = y + (_ << 20 & 4294967295 | _ >>> 12), _ = E + (y ^ S & (D ^ y)) + A[9] + 568446438 & 4294967295, E = D + (_ << 5 & 4294967295 | _ >>> 27), _ = S + (D ^ y & (E ^ D)) + A[14] + 3275163606 & 4294967295, S = E + (_ << 9 & 4294967295 | _ >>> 23), _ = y + (E ^ D & (S ^ E)) + A[3] + 4107603335 & 4294967295, y = S + (_ << 14 & 4294967295 | _ >>> 18), _ = D + (S ^ E & (y ^ S)) + A[8] + 1163531501 & 4294967295, D = y + (_ << 20 & 4294967295 | _ >>> 12), _ = E + (y ^ S & (D ^ y)) + A[13] + 2850285829 & 4294967295, E = D + (_ << 5 & 4294967295 | _ >>> 27), _ = S + (D ^ y & (E ^ D)) + A[2] + 4243563512 & 4294967295, S = E + (_ << 9 & 4294967295 | _ >>> 23), _ = y + (E ^ D & (S ^ E)) + A[7] + 1735328473 & 4294967295, y = S + (_ << 14 & 4294967295 | _ >>> 18), _ = D + (S ^ E & (y ^ S)) + A[12] + 2368359562 & 4294967295, D = y + (_ << 20 & 4294967295 | _ >>> 12), _ = E + (D ^ y ^ S) + A[5] + 4294588738 & 4294967295, E = D + (_ << 4 & 4294967295 | _ >>> 28), _ = S + (E ^ D ^ y) + A[8] + 2272392833 & 4294967295, S = E + (_ << 11 & 4294967295 | _ >>> 21), _ = y + (S ^ E ^ D) + A[11] + 1839030562 & 4294967295, y = S + (_ << 16 & 4294967295 | _ >>> 16), _ = D + (y ^ S ^ E) + A[14] + 4259657740 & 4294967295, D = y + (_ << 23 & 4294967295 | _ >>> 9), _ = E + (D ^ y ^ S) + A[1] + 2763975236 & 4294967295, E = D + (_ << 4 & 4294967295 | _ >>> 28), _ = S + (E ^ D ^ y) + A[4] + 1272893353 & 4294967295, S = E + (_ << 11 & 4294967295 | _ >>> 21), _ = y + (S ^ E ^ D) + A[7] + 4139469664 & 4294967295, y = S + (_ << 16 & 4294967295 | _ >>> 16), _ = D + (y ^ S ^ E) + A[10] + 3200236656 & 4294967295, D = y + (_ << 23 & 4294967295 | _ >>> 9), _ = E + (D ^ y ^ S) + A[13] + 681279174 & 4294967295, E = D + (_ << 4 & 4294967295 | _ >>> 28), _ = S + (E ^ D ^ y) + A[0] + 3936430074 & 4294967295, S = E + (_ << 11 & 4294967295 | _ >>> 21), _ = y + (S ^ E ^ D) + A[3] + 3572445317 & 4294967295, y = S + (_ << 16 & 4294967295 | _ >>> 16), _ = D + (y ^ S ^ E) + A[6] + 76029189 & 4294967295, D = y + (_ << 23 & 4294967295 | _ >>> 9), _ = E + (D ^ y ^ S) + A[9] + 3654602809 & 4294967295, E = D + (_ << 4 & 4294967295 | _ >>> 28), _ = S + (E ^ D ^ y) + A[12] + 3873151461 & 4294967295, S = E + (_ << 11 & 4294967295 | _ >>> 21), _ = y + (S ^ E ^ D) + A[15] + 530742520 & 4294967295, y = S + (_ << 16 & 4294967295 | _ >>> 16), _ = D + (y ^ S ^ E) + A[2] + 3299628645 & 4294967295, D = y + (_ << 23 & 4294967295 | _ >>> 9), _ = E + (y ^ (D | ~S)) + A[0] + 4096336452 & 4294967295, E = D + (_ << 6 & 4294967295 | _ >>> 26), _ = S + (D ^ (E | ~y)) + A[7] + 1126891415 & 4294967295, S = E + (_ << 10 & 4294967295 | _ >>> 22), _ = y + (E ^ (S | ~D)) + A[14] + 2878612391 & 4294967295, y = S + (_ << 15 & 4294967295 | _ >>> 17), _ = D + (S ^ (y | ~E)) + A[5] + 4237533241 & 4294967295, D = y + (_ << 21 & 4294967295 | _ >>> 11), _ = E + (y ^ (D | ~S)) + A[12] + 1700485571 & 4294967295, E = D + (_ << 6 & 4294967295 | _ >>> 26), _ = S + (D ^ (E | ~y)) + A[3] + 2399980690 & 4294967295, S = E + (_ << 10 & 4294967295 | _ >>> 22), _ = y + (E ^ (S | ~D)) + A[10] + 4293915773 & 4294967295, y = S + (_ << 15 & 4294967295 | _ >>> 17), _ = D + (S ^ (y | ~E)) + A[1] + 2240044497 & 4294967295, D = y + (_ << 21 & 4294967295 | _ >>> 11), _ = E + (y ^ (D | ~S)) + A[8] + 1873313359 & 4294967295, E = D + (_ << 6 & 4294967295 | _ >>> 26), _ = S + (D ^ (E | ~y)) + A[15] + 4264355552 & 4294967295, S = E + (_ << 10 & 4294967295 | _ >>> 22), _ = y + (E ^ (S | ~D)) + A[6] + 2734768916 & 4294967295, y = S + (_ << 15 & 4294967295 | _ >>> 17), _ = D + (S ^ (y | ~E)) + A[13] + 1309151649 & 4294967295, D = y + (_ << 21 & 4294967295 | _ >>> 11), _ = E + (y ^ (D | ~S)) + A[4] + 4149444226 & 4294967295, E = D + (_ << 6 & 4294967295 | _ >>> 26), _ = S + (D ^ (E | ~y)) + A[11] + 3174756917 & 4294967295, S = E + (_ << 10 & 4294967295 | _ >>> 22), _ = y + (E ^ (S | ~D)) + A[2] + 718787259 & 4294967295, y = S + (_ << 15 & 4294967295 | _ >>> 17), _ = D + (S ^ (y | ~E)) + A[9] + 3951481745 & 4294967295, T.g[0] = T.g[0] + E & 4294967295, T.g[1] = T.g[1] + (y + (_ << 21 & 4294967295 | _ >>> 11)) & 4294967295, T.g[2] = T.g[2] + y & 4294967295, T.g[3] = T.g[3] + S & 4294967295;
  }
  n.prototype.v = function(T, E) {
    E === void 0 && (E = T.length);
    const D = E - this.blockSize, A = this.C;
    let y = this.h, S = 0;
    for (; S < E; ) {
      if (y == 0) for (; S <= D; ) s(this, T, S), S += this.blockSize;
      if (typeof T == "string") {
        for (; S < E; )
          if (A[y++] = T.charCodeAt(S++), y == this.blockSize) {
            s(this, A), y = 0;
            break;
          }
      } else for (; S < E; ) if (A[y++] = T[S++], y == this.blockSize) {
        s(this, A), y = 0;
        break;
      }
    }
    this.h = y, this.o += E;
  }, n.prototype.A = function() {
    var T = Array((this.h < 56 ? this.blockSize : this.blockSize * 2) - this.h);
    T[0] = 128;
    for (var E = 1; E < T.length - 8; ++E) T[E] = 0;
    E = this.o * 8;
    for (var D = T.length - 8; D < T.length; ++D) T[D] = E & 255, E /= 256;
    for (this.v(T), T = Array(16), E = 0, D = 0; D < 4; ++D) for (let A = 0; A < 32; A += 8) T[E++] = this.g[D] >>> A & 255;
    return T;
  };
  function i(T, E) {
    var D = B;
    return Object.prototype.hasOwnProperty.call(D, T) ? D[T] : D[T] = E(T);
  }
  function o(T, E) {
    this.h = E;
    const D = [];
    let A = !0;
    for (let y = T.length - 1; y >= 0; y--) {
      const S = T[y] | 0;
      A && S == E || (D[y] = S, A = !1);
    }
    this.g = D;
  }
  var B = {};
  function u(T) {
    return -128 <= T && T < 128 ? i(T, function(E) {
      return new o([E | 0], E < 0 ? -1 : 0);
    }) : new o([T | 0], T < 0 ? -1 : 0);
  }
  function c(T) {
    if (isNaN(T) || !isFinite(T)) return f;
    if (T < 0) return H(c(-T));
    const E = [];
    let D = 1;
    for (let A = 0; T >= D; A++) E[A] = T / D | 0, D *= 4294967296;
    return new o(E, 0);
  }
  function C(T, E) {
    if (T.length == 0) throw Error("number format error: empty string");
    if (E = E || 10, E < 2 || 36 < E) throw Error("radix out of range: " + E);
    if (T.charAt(0) == "-") return H(C(T.substring(1), E));
    if (T.indexOf("-") >= 0) throw Error('number format error: interior "-" character');
    const D = c(Math.pow(E, 8));
    let A = f;
    for (let S = 0; S < T.length; S += 8) {
      var y = Math.min(8, T.length - S);
      const _ = parseInt(T.substring(S, S + y), E);
      y < 8 ? (y = c(Math.pow(E, y)), A = A.j(y).add(c(_))) : (A = A.j(D), A = A.add(c(_)));
    }
    return A;
  }
  var f = u(0), m = u(1), R = u(16777216);
  r = o.prototype, r.m = function() {
    if (x(this)) return -H(this).m();
    let T = 0, E = 1;
    for (let D = 0; D < this.g.length; D++) {
      const A = this.i(D);
      T += (A >= 0 ? A : 4294967296 + A) * E, E *= 4294967296;
    }
    return T;
  }, r.toString = function(T) {
    if (T = T || 10, T < 2 || 36 < T) throw Error("radix out of range: " + T);
    if (P(this)) return "0";
    if (x(this)) return "-" + H(this).toString(T);
    const E = c(Math.pow(T, 6));
    var D = this;
    let A = "";
    for (; ; ) {
      const y = ve(D, E).g;
      D = z(D, y.j(E));
      let S = ((D.g.length > 0 ? D.g[0] : D.h) >>> 0).toString(T);
      if (D = y, P(D)) return S + A;
      for (; S.length < 6; ) S = "0" + S;
      A = S + A;
    }
  }, r.i = function(T) {
    return T < 0 ? 0 : T < this.g.length ? this.g[T] : this.h;
  };
  function P(T) {
    if (T.h != 0) return !1;
    for (let E = 0; E < T.g.length; E++) if (T.g[E] != 0) return !1;
    return !0;
  }
  function x(T) {
    return T.h == -1;
  }
  r.l = function(T) {
    return T = z(this, T), x(T) ? -1 : P(T) ? 0 : 1;
  };
  function H(T) {
    const E = T.g.length, D = [];
    for (let A = 0; A < E; A++) D[A] = ~T.g[A];
    return new o(D, ~T.h).add(m);
  }
  r.abs = function() {
    return x(this) ? H(this) : this;
  }, r.add = function(T) {
    const E = Math.max(this.g.length, T.g.length), D = [];
    let A = 0;
    for (let y = 0; y <= E; y++) {
      let S = A + (this.i(y) & 65535) + (T.i(y) & 65535), _ = (S >>> 16) + (this.i(y) >>> 16) + (T.i(y) >>> 16);
      A = _ >>> 16, S &= 65535, _ &= 65535, D[y] = _ << 16 | S;
    }
    return new o(D, D[D.length - 1] & -2147483648 ? -1 : 0);
  };
  function z(T, E) {
    return T.add(H(E));
  }
  r.j = function(T) {
    if (P(this) || P(T)) return f;
    if (x(this)) return x(T) ? H(this).j(H(T)) : H(H(this).j(T));
    if (x(T)) return H(this.j(H(T)));
    if (this.l(R) < 0 && T.l(R) < 0) return c(this.m() * T.m());
    const E = this.g.length + T.g.length, D = [];
    for (var A = 0; A < 2 * E; A++) D[A] = 0;
    for (A = 0; A < this.g.length; A++) for (let y = 0; y < T.g.length; y++) {
      const S = this.i(A) >>> 16, _ = this.i(A) & 65535, et = T.i(y) >>> 16, Vn = T.i(y) & 65535;
      D[2 * A + 2 * y] += _ * Vn, se(D, 2 * A + 2 * y), D[2 * A + 2 * y + 1] += S * Vn, se(D, 2 * A + 2 * y + 1), D[2 * A + 2 * y + 1] += _ * et, se(D, 2 * A + 2 * y + 1), D[2 * A + 2 * y + 2] += S * et, se(D, 2 * A + 2 * y + 2);
    }
    for (T = 0; T < E; T++) D[T] = D[2 * T + 1] << 16 | D[2 * T];
    for (T = E; T < 2 * E; T++) D[T] = 0;
    return new o(D, 0);
  };
  function se(T, E) {
    for (; (T[E] & 65535) != T[E]; ) T[E + 1] += T[E] >>> 16, T[E] &= 65535, E++;
  }
  function De(T, E) {
    this.g = T, this.h = E;
  }
  function ve(T, E) {
    if (P(E)) throw Error("division by zero");
    if (P(T)) return new De(f, f);
    if (x(T)) return E = ve(H(T), E), new De(H(E.g), H(E.h));
    if (x(E)) return E = ve(T, H(E)), new De(H(E.g), E.h);
    if (T.g.length > 30) {
      if (x(T) || x(E)) throw Error("slowDivide_ only works with positive integers.");
      for (var D = m, A = E; A.l(T) <= 0; ) D = ct(D), A = ct(A);
      var y = we(D, 1), S = we(A, 1);
      for (A = we(A, 2), D = we(D, 2); !P(A); ) {
        var _ = S.add(A);
        _.l(T) <= 0 && (y = y.add(D), S = _), A = we(A, 1), D = we(D, 1);
      }
      return E = z(T, y.j(E)), new De(y, E);
    }
    for (y = f; T.l(E) >= 0; ) {
      for (D = Math.max(1, Math.floor(T.m() / E.m())), A = Math.ceil(Math.log(D) / Math.LN2), A = A <= 48 ? 1 : Math.pow(2, A - 48), S = c(D), _ = S.j(E); x(_) || _.l(T) > 0; ) D -= A, S = c(D), _ = S.j(E);
      P(S) && (S = m), y = y.add(S), T = z(T, _);
    }
    return new De(y, T);
  }
  r.B = function(T) {
    return ve(this, T).h;
  }, r.and = function(T) {
    const E = Math.max(this.g.length, T.g.length), D = [];
    for (let A = 0; A < E; A++) D[A] = this.i(A) & T.i(A);
    return new o(D, this.h & T.h);
  }, r.or = function(T) {
    const E = Math.max(this.g.length, T.g.length), D = [];
    for (let A = 0; A < E; A++) D[A] = this.i(A) | T.i(A);
    return new o(D, this.h | T.h);
  }, r.xor = function(T) {
    const E = Math.max(this.g.length, T.g.length), D = [];
    for (let A = 0; A < E; A++) D[A] = this.i(A) ^ T.i(A);
    return new o(D, this.h ^ T.h);
  };
  function ct(T) {
    const E = T.g.length + 1, D = [];
    for (let A = 0; A < E; A++) D[A] = T.i(A) << 1 | T.i(A - 1) >>> 31;
    return new o(D, T.h);
  }
  function we(T, E) {
    const D = E >> 5;
    E %= 32;
    const A = T.g.length - D, y = [];
    for (let S = 0; S < A; S++) y[S] = E > 0 ? T.i(S + D) >>> E | T.i(S + D + 1) << 32 - E : T.i(S + D);
    return new o(y, T.h);
  }
  n.prototype.digest = n.prototype.A, n.prototype.reset = n.prototype.u, n.prototype.update = n.prototype.v, aC = n, o.prototype.add = o.prototype.add, o.prototype.multiply = o.prototype.j, o.prototype.modulo = o.prototype.B, o.prototype.compare = o.prototype.l, o.prototype.toNumber = o.prototype.m, o.prototype.toString = o.prototype.toString, o.prototype.getBits = o.prototype.i, o.fromNumber = c, o.fromString = C, mn = o;
}).apply(typeof Jc < "u" ? Jc : typeof self < "u" ? self : typeof window < "u" ? window : {});
var vi = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
var BC, hs, uC, Ji, xa, cC, lC, hC;
(function() {
  var r, e = Object.defineProperty;
  function t(a) {
    a = [typeof globalThis == "object" && globalThis, a, typeof window == "object" && window, typeof self == "object" && self, typeof vi == "object" && vi];
    for (var l = 0; l < a.length; ++l) {
      var h = a[l];
      if (h && h.Math == Math) return h;
    }
    throw Error("Cannot find global object");
  }
  var n = t(this);
  function s(a, l) {
    if (l) e: {
      var h = n;
      a = a.split(".");
      for (var d = 0; d < a.length - 1; d++) {
        var v = a[d];
        if (!(v in h)) break e;
        h = h[v];
      }
      a = a[a.length - 1], d = h[a], l = l(d), l != d && l != null && e(h, a, { configurable: !0, writable: !0, value: l });
    }
  }
  s("Symbol.dispose", function(a) {
    return a || /* @__PURE__ */ Symbol("Symbol.dispose");
  }), s("Array.prototype.values", function(a) {
    return a || function() {
      return this[Symbol.iterator]();
    };
  }), s("Object.entries", function(a) {
    return a || function(l) {
      var h = [], d;
      for (d in l) Object.prototype.hasOwnProperty.call(l, d) && h.push([d, l[d]]);
      return h;
    };
  });
  var i = i || {}, o = this || self;
  function B(a) {
    var l = typeof a;
    return l == "object" && a != null || l == "function";
  }
  function u(a, l, h) {
    return a.call.apply(a.bind, arguments);
  }
  function c(a, l, h) {
    return c = u, c.apply(null, arguments);
  }
  function C(a, l) {
    var h = Array.prototype.slice.call(arguments, 1);
    return function() {
      var d = h.slice();
      return d.push.apply(d, arguments), a.apply(this, d);
    };
  }
  function f(a, l) {
    function h() {
    }
    h.prototype = l.prototype, a.Z = l.prototype, a.prototype = new h(), a.prototype.constructor = a, a.Ob = function(d, v, O) {
      for (var J = Array(arguments.length - 2), re = 2; re < arguments.length; re++) J[re - 2] = arguments[re];
      return l.prototype[v].apply(d, J);
    };
  }
  var m = typeof AsyncContext < "u" && typeof AsyncContext.Snapshot == "function" ? (a) => a && AsyncContext.Snapshot.wrap(a) : (a) => a;
  function R(a) {
    const l = a.length;
    if (l > 0) {
      const h = Array(l);
      for (let d = 0; d < l; d++) h[d] = a[d];
      return h;
    }
    return [];
  }
  function P(a, l) {
    for (let d = 1; d < arguments.length; d++) {
      const v = arguments[d];
      var h = typeof v;
      if (h = h != "object" ? h : v ? Array.isArray(v) ? "array" : h : "null", h == "array" || h == "object" && typeof v.length == "number") {
        h = a.length || 0;
        const O = v.length || 0;
        a.length = h + O;
        for (let J = 0; J < O; J++) a[h + J] = v[J];
      } else a.push(v);
    }
  }
  class x {
    constructor(l, h) {
      this.i = l, this.j = h, this.h = 0, this.g = null;
    }
    get() {
      let l;
      return this.h > 0 ? (this.h--, l = this.g, this.g = l.next, l.next = null) : l = this.i(), l;
    }
  }
  function H(a) {
    o.setTimeout(() => {
      throw a;
    }, 0);
  }
  function z() {
    var a = T;
    let l = null;
    return a.g && (l = a.g, a.g = a.g.next, a.g || (a.h = null), l.next = null), l;
  }
  class se {
    constructor() {
      this.h = this.g = null;
    }
    add(l, h) {
      const d = De.get();
      d.set(l, h), this.h ? this.h.next = d : this.g = d, this.h = d;
    }
  }
  var De = new x(() => new ve(), (a) => a.reset());
  class ve {
    constructor() {
      this.next = this.g = this.h = null;
    }
    set(l, h) {
      this.h = l, this.g = h, this.next = null;
    }
    reset() {
      this.next = this.g = this.h = null;
    }
  }
  let ct, we = !1, T = new se(), E = () => {
    const a = Promise.resolve(void 0);
    ct = () => {
      a.then(D);
    };
  };
  function D() {
    for (var a; a = z(); ) {
      try {
        a.h.call(a.g);
      } catch (h) {
        H(h);
      }
      var l = De;
      l.j(a), l.h < 100 && (l.h++, a.next = l.g, l.g = a);
    }
    we = !1;
  }
  function A() {
    this.u = this.u, this.C = this.C;
  }
  A.prototype.u = !1, A.prototype.dispose = function() {
    this.u || (this.u = !0, this.N());
  }, A.prototype[Symbol.dispose] = function() {
    this.dispose();
  }, A.prototype.N = function() {
    if (this.C) for (; this.C.length; ) this.C.shift()();
  };
  function y(a, l) {
    this.type = a, this.g = this.target = l, this.defaultPrevented = !1;
  }
  y.prototype.h = function() {
    this.defaultPrevented = !0;
  };
  var S = (function() {
    if (!o.addEventListener || !Object.defineProperty) return !1;
    var a = !1, l = Object.defineProperty({}, "passive", { get: function() {
      a = !0;
    } });
    try {
      const h = () => {
      };
      o.addEventListener("test", h, l), o.removeEventListener("test", h, l);
    } catch {
    }
    return a;
  })();
  function _(a) {
    return /^[\s\xa0]*$/.test(a);
  }
  function et(a, l) {
    y.call(this, a ? a.type : ""), this.relatedTarget = this.g = this.target = null, this.button = this.screenY = this.screenX = this.clientY = this.clientX = 0, this.key = "", this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = !1, this.state = null, this.pointerId = 0, this.pointerType = "", this.i = null, a && this.init(a, l);
  }
  f(et, y), et.prototype.init = function(a, l) {
    const h = this.type = a.type, d = a.changedTouches && a.changedTouches.length ? a.changedTouches[0] : null;
    this.target = a.target || a.srcElement, this.g = l, l = a.relatedTarget, l || (h == "mouseover" ? l = a.fromElement : h == "mouseout" && (l = a.toElement)), this.relatedTarget = l, d ? (this.clientX = d.clientX !== void 0 ? d.clientX : d.pageX, this.clientY = d.clientY !== void 0 ? d.clientY : d.pageY, this.screenX = d.screenX || 0, this.screenY = d.screenY || 0) : (this.clientX = a.clientX !== void 0 ? a.clientX : a.pageX, this.clientY = a.clientY !== void 0 ? a.clientY : a.pageY, this.screenX = a.screenX || 0, this.screenY = a.screenY || 0), this.button = a.button, this.key = a.key || "", this.ctrlKey = a.ctrlKey, this.altKey = a.altKey, this.shiftKey = a.shiftKey, this.metaKey = a.metaKey, this.pointerId = a.pointerId || 0, this.pointerType = a.pointerType, this.state = a.state, this.i = a, a.defaultPrevented && et.Z.h.call(this);
  }, et.prototype.h = function() {
    et.Z.h.call(this);
    const a = this.i;
    a.preventDefault ? a.preventDefault() : a.returnValue = !1;
  };
  var Vn = "closure_listenable_" + (Math.random() * 1e6 | 0), cd = 0;
  function ld(a, l, h, d, v) {
    this.listener = a, this.proxy = null, this.src = l, this.type = h, this.capture = !!d, this.ha = v, this.key = ++cd, this.da = this.fa = !1;
  }
  function hi(a) {
    a.da = !0, a.listener = null, a.proxy = null, a.src = null, a.ha = null;
  }
  function Ci(a, l, h) {
    for (const d in a) l.call(h, a[d], d, a);
  }
  function hd(a, l) {
    for (const h in a) l.call(void 0, a[h], h, a);
  }
  function hu(a) {
    const l = {};
    for (const h in a) l[h] = a[h];
    return l;
  }
  const Cu = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
  function fu(a, l) {
    let h, d;
    for (let v = 1; v < arguments.length; v++) {
      d = arguments[v];
      for (h in d) a[h] = d[h];
      for (let O = 0; O < Cu.length; O++) h = Cu[O], Object.prototype.hasOwnProperty.call(d, h) && (a[h] = d[h]);
    }
  }
  function fi(a) {
    this.src = a, this.g = {}, this.h = 0;
  }
  fi.prototype.add = function(a, l, h, d, v) {
    const O = a.toString();
    a = this.g[O], a || (a = this.g[O] = [], this.h++);
    const J = qo(a, l, d, v);
    return J > -1 ? (l = a[J], h || (l.fa = !1)) : (l = new ld(l, this.src, O, !!d, v), l.fa = h, a.push(l)), l;
  };
  function jo(a, l) {
    const h = l.type;
    if (h in a.g) {
      var d = a.g[h], v = Array.prototype.indexOf.call(d, l, void 0), O;
      (O = v >= 0) && Array.prototype.splice.call(d, v, 1), O && (hi(l), a.g[h].length == 0 && (delete a.g[h], a.h--));
    }
  }
  function qo(a, l, h, d) {
    for (let v = 0; v < a.length; ++v) {
      const O = a[v];
      if (!O.da && O.listener == l && O.capture == !!h && O.ha == d) return v;
    }
    return -1;
  }
  var Ko = "closure_lm_" + (Math.random() * 1e6 | 0), zo = {};
  function du(a, l, h, d, v) {
    if (Array.isArray(l)) {
      for (let O = 0; O < l.length; O++) du(a, l[O], h, d, v);
      return null;
    }
    return h = mu(h), a && a[Vn] ? a.J(l, h, B(d) ? !!d.capture : !1, v) : Cd(a, l, h, !1, d, v);
  }
  function Cd(a, l, h, d, v, O) {
    if (!l) throw Error("Invalid event type");
    const J = B(v) ? !!v.capture : !!v;
    let re = Wo(a);
    if (re || (a[Ko] = re = new fi(a)), h = re.add(l, h, d, J, O), h.proxy) return h;
    if (d = fd(), h.proxy = d, d.src = a, d.listener = h, a.addEventListener) S || (v = J), v === void 0 && (v = !1), a.addEventListener(l.toString(), d, v);
    else if (a.attachEvent) a.attachEvent(gu(l.toString()), d);
    else if (a.addListener && a.removeListener) a.addListener(d);
    else throw Error("addEventListener and attachEvent are unavailable.");
    return h;
  }
  function fd() {
    function a(h) {
      return l.call(a.src, a.listener, h);
    }
    const l = dd;
    return a;
  }
  function pu(a, l, h, d, v) {
    if (Array.isArray(l)) for (var O = 0; O < l.length; O++) pu(a, l[O], h, d, v);
    else d = B(d) ? !!d.capture : !!d, h = mu(h), a && a[Vn] ? (a = a.i, O = String(l).toString(), O in a.g && (l = a.g[O], h = qo(l, h, d, v), h > -1 && (hi(l[h]), Array.prototype.splice.call(l, h, 1), l.length == 0 && (delete a.g[O], a.h--)))) : a && (a = Wo(a)) && (l = a.g[l.toString()], a = -1, l && (a = qo(l, h, d, v)), (h = a > -1 ? l[a] : null) && Qo(h));
  }
  function Qo(a) {
    if (typeof a != "number" && a && !a.da) {
      var l = a.src;
      if (l && l[Vn]) jo(l.i, a);
      else {
        var h = a.type, d = a.proxy;
        l.removeEventListener ? l.removeEventListener(h, d, a.capture) : l.detachEvent ? l.detachEvent(gu(h), d) : l.addListener && l.removeListener && l.removeListener(d), (h = Wo(l)) ? (jo(h, a), h.h == 0 && (h.src = null, l[Ko] = null)) : hi(a);
      }
    }
  }
  function gu(a) {
    return a in zo ? zo[a] : zo[a] = "on" + a;
  }
  function dd(a, l) {
    if (a.da) a = !0;
    else {
      l = new et(l, this);
      const h = a.listener, d = a.ha || a.src;
      a.fa && Qo(a), a = h.call(d, l);
    }
    return a;
  }
  function Wo(a) {
    return a = a[Ko], a instanceof fi ? a : null;
  }
  var $o = "__closure_events_fn_" + (Math.random() * 1e9 >>> 0);
  function mu(a) {
    return typeof a == "function" ? a : (a[$o] || (a[$o] = function(l) {
      return a.handleEvent(l);
    }), a[$o]);
  }
  function je() {
    A.call(this), this.i = new fi(this), this.M = this, this.G = null;
  }
  f(je, A), je.prototype[Vn] = !0, je.prototype.removeEventListener = function(a, l, h, d) {
    pu(this, a, l, h, d);
  };
  function $e(a, l) {
    var h, d = a.G;
    if (d) for (h = []; d; d = d.G) h.push(d);
    if (a = a.M, d = l.type || l, typeof l == "string") l = new y(l, a);
    else if (l instanceof y) l.target = l.target || a;
    else {
      var v = l;
      l = new y(d, a), fu(l, v);
    }
    v = !0;
    let O, J;
    if (h) for (J = h.length - 1; J >= 0; J--) O = l.g = h[J], v = di(O, d, !0, l) && v;
    if (O = l.g = a, v = di(O, d, !0, l) && v, v = di(O, d, !1, l) && v, h) for (J = 0; J < h.length; J++) O = l.g = h[J], v = di(O, d, !1, l) && v;
  }
  je.prototype.N = function() {
    if (je.Z.N.call(this), this.i) {
      var a = this.i;
      for (const l in a.g) {
        const h = a.g[l];
        for (let d = 0; d < h.length; d++) hi(h[d]);
        delete a.g[l], a.h--;
      }
    }
    this.G = null;
  }, je.prototype.J = function(a, l, h, d) {
    return this.i.add(String(a), l, !1, h, d);
  }, je.prototype.K = function(a, l, h, d) {
    return this.i.add(String(a), l, !0, h, d);
  };
  function di(a, l, h, d) {
    if (l = a.i.g[String(l)], !l) return !0;
    l = l.concat();
    let v = !0;
    for (let O = 0; O < l.length; ++O) {
      const J = l[O];
      if (J && !J.da && J.capture == h) {
        const re = J.listener, ke = J.ha || J.src;
        J.fa && jo(a.i, J), v = re.call(ke, d) !== !1 && v;
      }
    }
    return v && !d.defaultPrevented;
  }
  function pd(a, l) {
    if (typeof a != "function") if (a && typeof a.handleEvent == "function") a = c(a.handleEvent, a);
    else throw Error("Invalid listener argument");
    return Number(l) > 2147483647 ? -1 : o.setTimeout(a, l || 0);
  }
  function Eu(a) {
    a.g = pd(() => {
      a.g = null, a.i && (a.i = !1, Eu(a));
    }, a.l);
    const l = a.h;
    a.h = null, a.m.apply(null, l);
  }
  class gd extends A {
    constructor(l, h) {
      super(), this.m = l, this.l = h, this.h = null, this.i = !1, this.g = null;
    }
    j(l) {
      this.h = arguments, this.g ? this.i = !0 : Eu(this);
    }
    N() {
      super.N(), this.g && (o.clearTimeout(this.g), this.g = null, this.i = !1, this.h = null);
    }
  }
  function Kr(a) {
    A.call(this), this.h = a, this.g = {};
  }
  f(Kr, A);
  var _u = [];
  function Du(a) {
    Ci(a.g, function(l, h) {
      this.g.hasOwnProperty(h) && Qo(l);
    }, a), a.g = {};
  }
  Kr.prototype.N = function() {
    Kr.Z.N.call(this), Du(this);
  }, Kr.prototype.handleEvent = function() {
    throw Error("EventHandler.handleEvent not implemented");
  };
  var Yo = o.JSON.stringify, md = o.JSON.parse, Ed = class {
    stringify(a) {
      return o.JSON.stringify(a, void 0);
    }
    parse(a) {
      return o.JSON.parse(a, void 0);
    }
  };
  function Iu() {
  }
  function wu() {
  }
  var zr = { OPEN: "a", hb: "b", ERROR: "c", tb: "d" };
  function Xo() {
    y.call(this, "d");
  }
  f(Xo, y);
  function Zo() {
    y.call(this, "c");
  }
  f(Zo, y);
  var xn = {}, yu = null;
  function pi() {
    return yu = yu || new je();
  }
  xn.Ia = "serverreachability";
  function Tu(a) {
    y.call(this, xn.Ia, a);
  }
  f(Tu, y);
  function Qr(a) {
    const l = pi();
    $e(l, new Tu(l));
  }
  xn.STAT_EVENT = "statevent";
  function Au(a, l) {
    y.call(this, xn.STAT_EVENT, a), this.stat = l;
  }
  f(Au, y);
  function Ye(a) {
    const l = pi();
    $e(l, new Au(l, a));
  }
  xn.Ja = "timingevent";
  function Ru(a, l) {
    y.call(this, xn.Ja, a), this.size = l;
  }
  f(Ru, y);
  function Wr(a, l) {
    if (typeof a != "function") throw Error("Fn must not be null and must be a function");
    return o.setTimeout(function() {
      a();
    }, l);
  }
  function $r() {
    this.g = !0;
  }
  $r.prototype.ua = function() {
    this.g = !1;
  };
  function _d(a, l, h, d, v, O) {
    a.info(function() {
      if (a.g) if (O) {
        var J = "", re = O.split("&");
        for (let Ce = 0; Ce < re.length; Ce++) {
          var ke = re[Ce].split("=");
          if (ke.length > 1) {
            const xe = ke[0];
            ke = ke[1];
            const vt = xe.split("_");
            J = vt.length >= 2 && vt[1] == "type" ? J + (xe + "=" + ke + "&") : J + (xe + "=redacted&");
          }
        }
      } else J = null;
      else J = O;
      return "XMLHTTP REQ (" + d + ") [attempt " + v + "]: " + l + `
` + h + `
` + J;
    });
  }
  function Dd(a, l, h, d, v, O, J) {
    a.info(function() {
      return "XMLHTTP RESP (" + d + ") [ attempt " + v + "]: " + l + `
` + h + `
` + O + " " + J;
    });
  }
  function ar(a, l, h, d) {
    a.info(function() {
      return "XMLHTTP TEXT (" + l + "): " + wd(a, h) + (d ? " " + d : "");
    });
  }
  function Id(a, l) {
    a.info(function() {
      return "TIMEOUT: " + l;
    });
  }
  $r.prototype.info = function() {
  };
  function wd(a, l) {
    if (!a.g) return l;
    if (!l) return null;
    try {
      const O = JSON.parse(l);
      if (O) {
        for (a = 0; a < O.length; a++) if (Array.isArray(O[a])) {
          var h = O[a];
          if (!(h.length < 2)) {
            var d = h[1];
            if (Array.isArray(d) && !(d.length < 1)) {
              var v = d[0];
              if (v != "noop" && v != "stop" && v != "close") for (let J = 1; J < d.length; J++) d[J] = "";
            }
          }
        }
      }
      return Yo(O);
    } catch {
      return l;
    }
  }
  var gi = { NO_ERROR: 0, cb: 1, qb: 2, pb: 3, kb: 4, ob: 5, rb: 6, Ga: 7, TIMEOUT: 8, ub: 9 }, vu = { ib: "complete", Fb: "success", ERROR: "error", Ga: "abort", xb: "ready", yb: "readystatechange", TIMEOUT: "timeout", sb: "incrementaldata", wb: "progress", lb: "downloadprogress", Nb: "uploadprogress" }, Pu;
  function ea() {
  }
  f(ea, Iu), ea.prototype.g = function() {
    return new XMLHttpRequest();
  }, Pu = new ea();
  function Yr(a) {
    return encodeURIComponent(String(a));
  }
  function yd(a) {
    var l = 1;
    a = a.split(":");
    const h = [];
    for (; l > 0 && a.length; ) h.push(a.shift()), l--;
    return a.length && h.push(a.join(":")), h;
  }
  function Yt(a, l, h, d) {
    this.j = a, this.i = l, this.l = h, this.S = d || 1, this.V = new Kr(this), this.H = 45e3, this.J = null, this.o = !1, this.u = this.B = this.A = this.M = this.F = this.T = this.D = null, this.G = [], this.g = null, this.C = 0, this.m = this.v = null, this.X = -1, this.K = !1, this.P = 0, this.O = null, this.W = this.L = this.U = this.R = !1, this.h = new Su();
  }
  function Su() {
    this.i = null, this.g = "", this.h = !1;
  }
  var Ou = {}, ta = {};
  function na(a, l, h) {
    a.M = 1, a.A = Ei(Rt(l)), a.u = h, a.R = !0, bu(a, null);
  }
  function bu(a, l) {
    a.F = Date.now(), mi(a), a.B = Rt(a.A);
    var h = a.B, d = a.S;
    Array.isArray(d) || (d = [String(d)]), qu(h.i, "t", d), a.C = 0, h = a.j.L, a.h = new Su(), a.g = uc(a.j, h ? l : null, !a.u), a.P > 0 && (a.O = new gd(c(a.Y, a, a.g), a.P)), l = a.V, h = a.g, d = a.ba;
    var v = "readystatechange";
    Array.isArray(v) || (v && (_u[0] = v.toString()), v = _u);
    for (let O = 0; O < v.length; O++) {
      const J = du(h, v[O], d || l.handleEvent, !1, l.h || l);
      if (!J) break;
      l.g[J.key] = J;
    }
    l = a.J ? hu(a.J) : {}, a.u ? (a.v || (a.v = "POST"), l["Content-Type"] = "application/x-www-form-urlencoded", a.g.ea(
      a.B,
      a.v,
      a.u,
      l
    )) : (a.v = "GET", a.g.ea(a.B, a.v, null, l)), Qr(), _d(a.i, a.v, a.B, a.l, a.S, a.u);
  }
  Yt.prototype.ba = function(a) {
    a = a.target;
    const l = this.O;
    l && en(a) == 3 ? l.j() : this.Y(a);
  }, Yt.prototype.Y = function(a) {
    try {
      if (a == this.g) e: {
        const re = en(this.g), ke = this.g.ya(), Ce = this.g.ca();
        if (!(re < 3) && (re != 3 || this.g && (this.h.h || this.g.la() || Xu(this.g)))) {
          this.K || re != 4 || ke == 7 || (ke == 8 || Ce <= 0 ? Qr(3) : Qr(2)), ra(this);
          var l = this.g.ca();
          this.X = l;
          var h = Td(this);
          if (this.o = l == 200, Dd(this.i, this.v, this.B, this.l, this.S, re, l), this.o) {
            if (this.U && !this.L) {
              t: {
                if (this.g) {
                  var d, v = this.g;
                  if ((d = v.g ? v.g.getResponseHeader("X-HTTP-Initial-Response") : null) && !_(d)) {
                    var O = d;
                    break t;
                  }
                }
                O = null;
              }
              if (a = O) ar(this.i, this.l, a, "Initial handshake response via X-HTTP-Initial-Response"), this.L = !0, sa(this, a);
              else {
                this.o = !1, this.m = 3, Ye(12), Mn(this), Xr(this);
                break e;
              }
            }
            if (this.R) {
              a = !0;
              let xe;
              for (; !this.K && this.C < h.length; ) if (xe = Ad(this, h), xe == ta) {
                re == 4 && (this.m = 4, Ye(14), a = !1), ar(this.i, this.l, null, "[Incomplete Response]");
                break;
              } else if (xe == Ou) {
                this.m = 4, Ye(15), ar(this.i, this.l, h, "[Invalid Chunk]"), a = !1;
                break;
              } else ar(this.i, this.l, xe, null), sa(this, xe);
              if (Nu(this) && this.C != 0 && (this.h.g = this.h.g.slice(this.C), this.C = 0), re != 4 || h.length != 0 || this.h.h || (this.m = 1, Ye(16), a = !1), this.o = this.o && a, !a) ar(
                this.i,
                this.l,
                h,
                "[Invalid Chunked Response]"
              ), Mn(this), Xr(this);
              else if (h.length > 0 && !this.W) {
                this.W = !0;
                var J = this.j;
                J.g == this && J.aa && !J.P && (J.j.info("Great, no buffering proxy detected. Bytes received: " + h.length), ha(J), J.P = !0, Ye(11));
              }
            } else ar(this.i, this.l, h, null), sa(this, h);
            re == 4 && Mn(this), this.o && !this.K && (re == 4 ? ic(this.j, this) : (this.o = !1, mi(this)));
          } else Gd(this.g), l == 400 && h.indexOf("Unknown SID") > 0 ? (this.m = 3, Ye(12)) : (this.m = 0, Ye(13)), Mn(this), Xr(this);
        }
      }
    } catch {
    }
  };
  function Td(a) {
    if (!Nu(a)) return a.g.la();
    const l = Xu(a.g);
    if (l === "") return "";
    let h = "";
    const d = l.length, v = en(a.g) == 4;
    if (!a.h.i) {
      if (typeof TextDecoder > "u") return Mn(a), Xr(a), "";
      a.h.i = new o.TextDecoder();
    }
    for (let O = 0; O < d; O++) a.h.h = !0, h += a.h.i.decode(l[O], { stream: !(v && O == d - 1) });
    return l.length = 0, a.h.g += h, a.C = 0, a.h.g;
  }
  function Nu(a) {
    return a.g ? a.v == "GET" && a.M != 2 && a.j.Aa : !1;
  }
  function Ad(a, l) {
    var h = a.C, d = l.indexOf(`
`, h);
    return d == -1 ? ta : (h = Number(l.substring(h, d)), isNaN(h) ? Ou : (d += 1, d + h > l.length ? ta : (l = l.slice(d, d + h), a.C = d + h, l)));
  }
  Yt.prototype.cancel = function() {
    this.K = !0, Mn(this);
  };
  function mi(a) {
    a.T = Date.now() + a.H, Fu(a, a.H);
  }
  function Fu(a, l) {
    if (a.D != null) throw Error("WatchDog timer not null");
    a.D = Wr(c(a.aa, a), l);
  }
  function ra(a) {
    a.D && (o.clearTimeout(a.D), a.D = null);
  }
  Yt.prototype.aa = function() {
    this.D = null;
    const a = Date.now();
    a - this.T >= 0 ? (Id(this.i, this.B), this.M != 2 && (Qr(), Ye(17)), Mn(this), this.m = 2, Xr(this)) : Fu(this, this.T - a);
  };
  function Xr(a) {
    a.j.I == 0 || a.K || ic(a.j, a);
  }
  function Mn(a) {
    ra(a);
    var l = a.O;
    l && typeof l.dispose == "function" && l.dispose(), a.O = null, Du(a.V), a.g && (l = a.g, a.g = null, l.abort(), l.dispose());
  }
  function sa(a, l) {
    try {
      var h = a.j;
      if (h.I != 0 && (h.g == a || ia(h.h, a))) {
        if (!a.L && ia(h.h, a) && h.I == 3) {
          try {
            var d = h.Ba.g.parse(l);
          } catch {
            d = null;
          }
          if (Array.isArray(d) && d.length == 3) {
            var v = d;
            if (v[0] == 0) {
              e:
                if (!h.v) {
                  if (h.g) if (h.g.F + 3e3 < a.F) yi(h), Ii(h);
                  else break e;
                  la(h), Ye(18);
                }
            } else h.xa = v[1], 0 < h.xa - h.K && v[2] < 37500 && h.F && h.A == 0 && !h.C && (h.C = Wr(c(h.Va, h), 6e3));
            Vu(h.h) <= 1 && h.ta && (h.ta = void 0);
          } else Hn(h, 11);
        } else if ((a.L || h.g == a) && yi(h), !_(l)) for (v = h.Ba.g.parse(l), l = 0; l < v.length; l++) {
          let Ce = v[l];
          const xe = Ce[0];
          if (!(xe <= h.K)) if (h.K = xe, Ce = Ce[1], h.I == 2) if (Ce[0] == "c") {
            h.M = Ce[1], h.ba = Ce[2];
            const vt = Ce[3];
            vt != null && (h.ka = vt, h.j.info("VER=" + h.ka));
            const Un = Ce[4];
            Un != null && (h.za = Un, h.j.info("SVER=" + h.za));
            const tn = Ce[5];
            tn != null && typeof tn == "number" && tn > 0 && (d = 1.5 * tn, h.O = d, h.j.info("backChannelRequestTimeoutMs_=" + d)), d = h;
            const nn = a.g;
            if (nn) {
              const Ai = nn.g ? nn.g.getResponseHeader("X-Client-Wire-Protocol") : null;
              if (Ai) {
                var O = d.h;
                O.g || Ai.indexOf("spdy") == -1 && Ai.indexOf("quic") == -1 && Ai.indexOf("h2") == -1 || (O.j = O.l, O.g = /* @__PURE__ */ new Set(), O.h && (oa(O, O.h), O.h = null));
              }
              if (d.G) {
                const Ca = nn.g ? nn.g.getResponseHeader("X-HTTP-Session-Id") : null;
                Ca && (d.wa = Ca, ge(d.J, d.G, Ca));
              }
            }
            h.I = 3, h.l && h.l.ra(), h.aa && (h.T = Date.now() - a.F, h.j.info("Handshake RTT: " + h.T + "ms")), d = h;
            var J = a;
            if (d.na = Bc(d, d.L ? d.ba : null, d.W), J.L) {
              xu(d.h, J);
              var re = J, ke = d.O;
              ke && (re.H = ke), re.D && (ra(re), mi(re)), d.g = J;
            } else rc(d);
            h.i.length > 0 && wi(h);
          } else Ce[0] != "stop" && Ce[0] != "close" || Hn(h, 7);
          else h.I == 3 && (Ce[0] == "stop" || Ce[0] == "close" ? Ce[0] == "stop" ? Hn(h, 7) : ca(h) : Ce[0] != "noop" && h.l && h.l.qa(Ce), h.A = 0);
        }
      }
      Qr(4);
    } catch {
    }
  }
  var Rd = class {
    constructor(a, l) {
      this.g = a, this.map = l;
    }
  };
  function Lu(a) {
    this.l = a || 10, o.PerformanceNavigationTiming ? (a = o.performance.getEntriesByType("navigation"), a = a.length > 0 && (a[0].nextHopProtocol == "hq" || a[0].nextHopProtocol == "h2")) : a = !!(o.chrome && o.chrome.loadTimes && o.chrome.loadTimes() && o.chrome.loadTimes().wasFetchedViaSpdy), this.j = a ? this.l : 1, this.g = null, this.j > 1 && (this.g = /* @__PURE__ */ new Set()), this.h = null, this.i = [];
  }
  function ku(a) {
    return a.h ? !0 : a.g ? a.g.size >= a.j : !1;
  }
  function Vu(a) {
    return a.h ? 1 : a.g ? a.g.size : 0;
  }
  function ia(a, l) {
    return a.h ? a.h == l : a.g ? a.g.has(l) : !1;
  }
  function oa(a, l) {
    a.g ? a.g.add(l) : a.h = l;
  }
  function xu(a, l) {
    a.h && a.h == l ? a.h = null : a.g && a.g.has(l) && a.g.delete(l);
  }
  Lu.prototype.cancel = function() {
    if (this.i = Mu(this), this.h) this.h.cancel(), this.h = null;
    else if (this.g && this.g.size !== 0) {
      for (const a of this.g.values()) a.cancel();
      this.g.clear();
    }
  };
  function Mu(a) {
    if (a.h != null) return a.i.concat(a.h.G);
    if (a.g != null && a.g.size !== 0) {
      let l = a.i;
      for (const h of a.g.values()) l = l.concat(h.G);
      return l;
    }
    return R(a.i);
  }
  var Gu = RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");
  function vd(a, l) {
    if (a) {
      a = a.split("&");
      for (let h = 0; h < a.length; h++) {
        const d = a[h].indexOf("=");
        let v, O = null;
        d >= 0 ? (v = a[h].substring(0, d), O = a[h].substring(d + 1)) : v = a[h], l(v, O ? decodeURIComponent(O.replace(/\+/g, " ")) : "");
      }
    }
  }
  function Xt(a) {
    this.g = this.o = this.j = "", this.u = null, this.m = this.h = "", this.l = !1;
    let l;
    a instanceof Xt ? (this.l = a.l, Zr(this, a.j), this.o = a.o, this.g = a.g, es(this, a.u), this.h = a.h, aa(this, Ku(a.i)), this.m = a.m) : a && (l = String(a).match(Gu)) ? (this.l = !1, Zr(this, l[1] || "", !0), this.o = ts(l[2] || ""), this.g = ts(l[3] || "", !0), es(this, l[4]), this.h = ts(l[5] || "", !0), aa(this, l[6] || "", !0), this.m = ts(l[7] || "")) : (this.l = !1, this.i = new rs(null, this.l));
  }
  Xt.prototype.toString = function() {
    const a = [];
    var l = this.j;
    l && a.push(ns(l, Hu, !0), ":");
    var h = this.g;
    return (h || l == "file") && (a.push("//"), (l = this.o) && a.push(ns(l, Hu, !0), "@"), a.push(Yr(h).replace(/%25([0-9a-fA-F]{2})/g, "%$1")), h = this.u, h != null && a.push(":", String(h))), (h = this.h) && (this.g && h.charAt(0) != "/" && a.push("/"), a.push(ns(h, h.charAt(0) == "/" ? Od : Sd, !0))), (h = this.i.toString()) && a.push("?", h), (h = this.m) && a.push("#", ns(h, Nd)), a.join("");
  }, Xt.prototype.resolve = function(a) {
    const l = Rt(this);
    let h = !!a.j;
    h ? Zr(l, a.j) : h = !!a.o, h ? l.o = a.o : h = !!a.g, h ? l.g = a.g : h = a.u != null;
    var d = a.h;
    if (h) es(l, a.u);
    else if (h = !!a.h) {
      if (d.charAt(0) != "/") if (this.g && !this.h) d = "/" + d;
      else {
        var v = l.h.lastIndexOf("/");
        v != -1 && (d = l.h.slice(0, v + 1) + d);
      }
      if (v = d, v == ".." || v == ".") d = "";
      else if (v.indexOf("./") != -1 || v.indexOf("/.") != -1) {
        d = v.lastIndexOf("/", 0) == 0, v = v.split("/");
        const O = [];
        for (let J = 0; J < v.length; ) {
          const re = v[J++];
          re == "." ? d && J == v.length && O.push("") : re == ".." ? ((O.length > 1 || O.length == 1 && O[0] != "") && O.pop(), d && J == v.length && O.push("")) : (O.push(re), d = !0);
        }
        d = O.join("/");
      } else d = v;
    }
    return h ? l.h = d : h = a.i.toString() !== "", h ? aa(l, Ku(a.i)) : h = !!a.m, h && (l.m = a.m), l;
  };
  function Rt(a) {
    return new Xt(a);
  }
  function Zr(a, l, h) {
    a.j = h ? ts(l, !0) : l, a.j && (a.j = a.j.replace(/:$/, ""));
  }
  function es(a, l) {
    if (l) {
      if (l = Number(l), isNaN(l) || l < 0) throw Error("Bad port number " + l);
      a.u = l;
    } else a.u = null;
  }
  function aa(a, l, h) {
    l instanceof rs ? (a.i = l, Fd(a.i, a.l)) : (h || (l = ns(l, bd)), a.i = new rs(l, a.l));
  }
  function ge(a, l, h) {
    a.i.set(l, h);
  }
  function Ei(a) {
    return ge(a, "zx", Math.floor(Math.random() * 2147483648).toString(36) + Math.abs(Math.floor(Math.random() * 2147483648) ^ Date.now()).toString(36)), a;
  }
  function ts(a, l) {
    return a ? l ? decodeURI(a.replace(/%25/g, "%2525")) : decodeURIComponent(a) : "";
  }
  function ns(a, l, h) {
    return typeof a == "string" ? (a = encodeURI(a).replace(l, Pd), h && (a = a.replace(/%25([0-9a-fA-F]{2})/g, "%$1")), a) : null;
  }
  function Pd(a) {
    return a = a.charCodeAt(0), "%" + (a >> 4 & 15).toString(16) + (a & 15).toString(16);
  }
  var Hu = /[#\/\?@]/g, Sd = /[#\?:]/g, Od = /[#\?]/g, bd = /[#\?@]/g, Nd = /#/g;
  function rs(a, l) {
    this.h = this.g = null, this.i = a || null, this.j = !!l;
  }
  function Gn(a) {
    a.g || (a.g = /* @__PURE__ */ new Map(), a.h = 0, a.i && vd(a.i, function(l, h) {
      a.add(decodeURIComponent(l.replace(/\+/g, " ")), h);
    }));
  }
  r = rs.prototype, r.add = function(a, l) {
    Gn(this), this.i = null, a = Br(this, a);
    let h = this.g.get(a);
    return h || this.g.set(a, h = []), h.push(l), this.h += 1, this;
  };
  function Uu(a, l) {
    Gn(a), l = Br(a, l), a.g.has(l) && (a.i = null, a.h -= a.g.get(l).length, a.g.delete(l));
  }
  function Ju(a, l) {
    return Gn(a), l = Br(a, l), a.g.has(l);
  }
  r.forEach = function(a, l) {
    Gn(this), this.g.forEach(function(h, d) {
      h.forEach(function(v) {
        a.call(l, v, d, this);
      }, this);
    }, this);
  };
  function ju(a, l) {
    Gn(a);
    let h = [];
    if (typeof l == "string") Ju(a, l) && (h = h.concat(a.g.get(Br(a, l))));
    else for (a = Array.from(a.g.values()), l = 0; l < a.length; l++) h = h.concat(a[l]);
    return h;
  }
  r.set = function(a, l) {
    return Gn(this), this.i = null, a = Br(this, a), Ju(this, a) && (this.h -= this.g.get(a).length), this.g.set(a, [l]), this.h += 1, this;
  }, r.get = function(a, l) {
    return a ? (a = ju(this, a), a.length > 0 ? String(a[0]) : l) : l;
  };
  function qu(a, l, h) {
    Uu(a, l), h.length > 0 && (a.i = null, a.g.set(Br(a, l), R(h)), a.h += h.length);
  }
  r.toString = function() {
    if (this.i) return this.i;
    if (!this.g) return "";
    const a = [], l = Array.from(this.g.keys());
    for (let d = 0; d < l.length; d++) {
      var h = l[d];
      const v = Yr(h);
      h = ju(this, h);
      for (let O = 0; O < h.length; O++) {
        let J = v;
        h[O] !== "" && (J += "=" + Yr(h[O])), a.push(J);
      }
    }
    return this.i = a.join("&");
  };
  function Ku(a) {
    const l = new rs();
    return l.i = a.i, a.g && (l.g = new Map(a.g), l.h = a.h), l;
  }
  function Br(a, l) {
    return l = String(l), a.j && (l = l.toLowerCase()), l;
  }
  function Fd(a, l) {
    l && !a.j && (Gn(a), a.i = null, a.g.forEach(function(h, d) {
      const v = d.toLowerCase();
      d != v && (Uu(this, d), qu(this, v, h));
    }, a)), a.j = l;
  }
  function Ld(a, l) {
    const h = new $r();
    if (o.Image) {
      const d = new Image();
      d.onload = C(Zt, h, "TestLoadImage: loaded", !0, l, d), d.onerror = C(Zt, h, "TestLoadImage: error", !1, l, d), d.onabort = C(Zt, h, "TestLoadImage: abort", !1, l, d), d.ontimeout = C(Zt, h, "TestLoadImage: timeout", !1, l, d), o.setTimeout(function() {
        d.ontimeout && d.ontimeout();
      }, 1e4), d.src = a;
    } else l(!1);
  }
  function kd(a, l) {
    const h = new $r(), d = new AbortController(), v = setTimeout(() => {
      d.abort(), Zt(h, "TestPingServer: timeout", !1, l);
    }, 1e4);
    fetch(a, { signal: d.signal }).then((O) => {
      clearTimeout(v), O.ok ? Zt(h, "TestPingServer: ok", !0, l) : Zt(h, "TestPingServer: server error", !1, l);
    }).catch(() => {
      clearTimeout(v), Zt(h, "TestPingServer: error", !1, l);
    });
  }
  function Zt(a, l, h, d, v) {
    try {
      v && (v.onload = null, v.onerror = null, v.onabort = null, v.ontimeout = null), d(h);
    } catch {
    }
  }
  function Vd() {
    this.g = new Ed();
  }
  function Ba(a) {
    this.i = a.Sb || null, this.h = a.ab || !1;
  }
  f(Ba, Iu), Ba.prototype.g = function() {
    return new _i(this.i, this.h);
  };
  function _i(a, l) {
    je.call(this), this.H = a, this.o = l, this.m = void 0, this.status = this.readyState = 0, this.responseType = this.responseText = this.response = this.statusText = "", this.onreadystatechange = null, this.A = new Headers(), this.h = null, this.F = "GET", this.D = "", this.g = !1, this.B = this.j = this.l = null, this.v = new AbortController();
  }
  f(_i, je), r = _i.prototype, r.open = function(a, l) {
    if (this.readyState != 0) throw this.abort(), Error("Error reopening a connection");
    this.F = a, this.D = l, this.readyState = 1, is(this);
  }, r.send = function(a) {
    if (this.readyState != 1) throw this.abort(), Error("need to call open() first. ");
    if (this.v.signal.aborted) throw this.abort(), Error("Request was aborted.");
    this.g = !0;
    const l = { headers: this.A, method: this.F, credentials: this.m, cache: void 0, signal: this.v.signal };
    a && (l.body = a), (this.H || o).fetch(new Request(this.D, l)).then(this.Pa.bind(this), this.ga.bind(this));
  }, r.abort = function() {
    this.response = this.responseText = "", this.A = new Headers(), this.status = 0, this.v.abort(), this.j && this.j.cancel("Request was aborted.").catch(() => {
    }), this.readyState >= 1 && this.g && this.readyState != 4 && (this.g = !1, ss(this)), this.readyState = 0;
  }, r.Pa = function(a) {
    if (this.g && (this.l = a, this.h || (this.status = this.l.status, this.statusText = this.l.statusText, this.h = a.headers, this.readyState = 2, is(this)), this.g && (this.readyState = 3, is(this), this.g))) if (this.responseType === "arraybuffer") a.arrayBuffer().then(this.Na.bind(this), this.ga.bind(this));
    else if (typeof o.ReadableStream < "u" && "body" in a) {
      if (this.j = a.body.getReader(), this.o) {
        if (this.responseType) throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');
        this.response = [];
      } else this.response = this.responseText = "", this.B = new TextDecoder();
      zu(this);
    } else a.text().then(this.Oa.bind(this), this.ga.bind(this));
  };
  function zu(a) {
    a.j.read().then(a.Ma.bind(a)).catch(a.ga.bind(a));
  }
  r.Ma = function(a) {
    if (this.g) {
      if (this.o && a.value) this.response.push(a.value);
      else if (!this.o) {
        var l = a.value ? a.value : new Uint8Array(0);
        (l = this.B.decode(l, { stream: !a.done })) && (this.response = this.responseText += l);
      }
      a.done ? ss(this) : is(this), this.readyState == 3 && zu(this);
    }
  }, r.Oa = function(a) {
    this.g && (this.response = this.responseText = a, ss(this));
  }, r.Na = function(a) {
    this.g && (this.response = a, ss(this));
  }, r.ga = function() {
    this.g && ss(this);
  };
  function ss(a) {
    a.readyState = 4, a.l = null, a.j = null, a.B = null, is(a);
  }
  r.setRequestHeader = function(a, l) {
    this.A.append(a, l);
  }, r.getResponseHeader = function(a) {
    return this.h && this.h.get(a.toLowerCase()) || "";
  }, r.getAllResponseHeaders = function() {
    if (!this.h) return "";
    const a = [], l = this.h.entries();
    for (var h = l.next(); !h.done; ) h = h.value, a.push(h[0] + ": " + h[1]), h = l.next();
    return a.join(`\r
`);
  };
  function is(a) {
    a.onreadystatechange && a.onreadystatechange.call(a);
  }
  Object.defineProperty(_i.prototype, "withCredentials", { get: function() {
    return this.m === "include";
  }, set: function(a) {
    this.m = a ? "include" : "same-origin";
  } });
  function Qu(a) {
    let l = "";
    return Ci(a, function(h, d) {
      l += d, l += ":", l += h, l += `\r
`;
    }), l;
  }
  function ua(a, l, h) {
    e: {
      for (d in h) {
        var d = !1;
        break e;
      }
      d = !0;
    }
    d || (h = Qu(h), typeof a == "string" ? h != null && Yr(h) : ge(a, l, h));
  }
  function Ae(a) {
    je.call(this), this.headers = /* @__PURE__ */ new Map(), this.L = a || null, this.h = !1, this.g = null, this.D = "", this.o = 0, this.l = "", this.j = this.B = this.v = this.A = !1, this.m = null, this.F = "", this.H = !1;
  }
  f(Ae, je);
  var xd = /^https?$/i, Md = ["POST", "PUT"];
  r = Ae.prototype, r.Fa = function(a) {
    this.H = a;
  }, r.ea = function(a, l, h, d) {
    if (this.g) throw Error("[goog.net.XhrIo] Object is active with another request=" + this.D + "; newUri=" + a);
    l = l ? l.toUpperCase() : "GET", this.D = a, this.l = "", this.o = 0, this.A = !1, this.h = !0, this.g = this.L ? this.L.g() : Pu.g(), this.g.onreadystatechange = m(c(this.Ca, this));
    try {
      this.B = !0, this.g.open(l, String(a), !0), this.B = !1;
    } catch (O) {
      Wu(this, O);
      return;
    }
    if (a = h || "", h = new Map(this.headers), d) if (Object.getPrototypeOf(d) === Object.prototype) for (var v in d) h.set(v, d[v]);
    else if (typeof d.keys == "function" && typeof d.get == "function") for (const O of d.keys()) h.set(O, d.get(O));
    else throw Error("Unknown input type for opt_headers: " + String(d));
    d = Array.from(h.keys()).find((O) => O.toLowerCase() == "content-type"), v = o.FormData && a instanceof o.FormData, !(Array.prototype.indexOf.call(Md, l, void 0) >= 0) || d || v || h.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
    for (const [O, J] of h) this.g.setRequestHeader(O, J);
    this.F && (this.g.responseType = this.F), "withCredentials" in this.g && this.g.withCredentials !== this.H && (this.g.withCredentials = this.H);
    try {
      this.m && (clearTimeout(this.m), this.m = null), this.v = !0, this.g.send(a), this.v = !1;
    } catch (O) {
      Wu(this, O);
    }
  };
  function Wu(a, l) {
    a.h = !1, a.g && (a.j = !0, a.g.abort(), a.j = !1), a.l = l, a.o = 5, $u(a), Di(a);
  }
  function $u(a) {
    a.A || (a.A = !0, $e(a, "complete"), $e(a, "error"));
  }
  r.abort = function(a) {
    this.g && this.h && (this.h = !1, this.j = !0, this.g.abort(), this.j = !1, this.o = a || 7, $e(this, "complete"), $e(this, "abort"), Di(this));
  }, r.N = function() {
    this.g && (this.h && (this.h = !1, this.j = !0, this.g.abort(), this.j = !1), Di(this, !0)), Ae.Z.N.call(this);
  }, r.Ca = function() {
    this.u || (this.B || this.v || this.j ? Yu(this) : this.Xa());
  }, r.Xa = function() {
    Yu(this);
  };
  function Yu(a) {
    if (a.h && typeof i < "u") {
      if (a.v && en(a) == 4) setTimeout(a.Ca.bind(a), 0);
      else if ($e(a, "readystatechange"), en(a) == 4) {
        a.h = !1;
        try {
          const O = a.ca();
          e: switch (O) {
            case 200:
            case 201:
            case 202:
            case 204:
            case 206:
            case 304:
            case 1223:
              var l = !0;
              break e;
            default:
              l = !1;
          }
          var h;
          if (!(h = l)) {
            var d;
            if (d = O === 0) {
              let J = String(a.D).match(Gu)[1] || null;
              !J && o.self && o.self.location && (J = o.self.location.protocol.slice(0, -1)), d = !xd.test(J ? J.toLowerCase() : "");
            }
            h = d;
          }
          if (h) $e(a, "complete"), $e(a, "success");
          else {
            a.o = 6;
            try {
              var v = en(a) > 2 ? a.g.statusText : "";
            } catch {
              v = "";
            }
            a.l = v + " [" + a.ca() + "]", $u(a);
          }
        } finally {
          Di(a);
        }
      }
    }
  }
  function Di(a, l) {
    if (a.g) {
      a.m && (clearTimeout(a.m), a.m = null);
      const h = a.g;
      a.g = null, l || $e(a, "ready");
      try {
        h.onreadystatechange = null;
      } catch {
      }
    }
  }
  r.isActive = function() {
    return !!this.g;
  };
  function en(a) {
    return a.g ? a.g.readyState : 0;
  }
  r.ca = function() {
    try {
      return en(this) > 2 ? this.g.status : -1;
    } catch {
      return -1;
    }
  }, r.la = function() {
    try {
      return this.g ? this.g.responseText : "";
    } catch {
      return "";
    }
  }, r.La = function(a) {
    if (this.g) {
      var l = this.g.responseText;
      return a && l.indexOf(a) == 0 && (l = l.substring(a.length)), md(l);
    }
  };
  function Xu(a) {
    try {
      if (!a.g) return null;
      if ("response" in a.g) return a.g.response;
      switch (a.F) {
        case "":
        case "text":
          return a.g.responseText;
        case "arraybuffer":
          if ("mozResponseArrayBuffer" in a.g) return a.g.mozResponseArrayBuffer;
      }
      return null;
    } catch {
      return null;
    }
  }
  function Gd(a) {
    const l = {};
    a = (a.g && en(a) >= 2 && a.g.getAllResponseHeaders() || "").split(`\r
`);
    for (let d = 0; d < a.length; d++) {
      if (_(a[d])) continue;
      var h = yd(a[d]);
      const v = h[0];
      if (h = h[1], typeof h != "string") continue;
      h = h.trim();
      const O = l[v] || [];
      l[v] = O, O.push(h);
    }
    hd(l, function(d) {
      return d.join(", ");
    });
  }
  r.ya = function() {
    return this.o;
  }, r.Ha = function() {
    return typeof this.l == "string" ? this.l : String(this.l);
  };
  function os(a, l, h) {
    return h && h.internalChannelParams && h.internalChannelParams[a] || l;
  }
  function Zu(a) {
    this.za = 0, this.i = [], this.j = new $r(), this.ba = this.na = this.J = this.W = this.g = this.wa = this.G = this.H = this.u = this.U = this.o = null, this.Ya = this.V = 0, this.Sa = os("failFast", !1, a), this.F = this.C = this.v = this.m = this.l = null, this.X = !0, this.xa = this.K = -1, this.Y = this.A = this.D = 0, this.Qa = os("baseRetryDelayMs", 5e3, a), this.Za = os("retryDelaySeedMs", 1e4, a), this.Ta = os("forwardChannelMaxRetries", 2, a), this.va = os("forwardChannelRequestTimeoutMs", 2e4, a), this.ma = a && a.xmlHttpFactory || void 0, this.Ua = a && a.Rb || void 0, this.Aa = a && a.useFetchStreams || !1, this.O = void 0, this.L = a && a.supportsCrossDomainXhr || !1, this.M = "", this.h = new Lu(a && a.concurrentRequestLimit), this.Ba = new Vd(), this.S = a && a.fastHandshake || !1, this.R = a && a.encodeInitMessageHeaders || !1, this.S && this.R && (this.R = !1), this.Ra = a && a.Pb || !1, a && a.ua && this.j.ua(), a && a.forceLongPolling && (this.X = !1), this.aa = !this.S && this.X && a && a.detectBufferingProxy || !1, this.ia = void 0, a && a.longPollingTimeout && a.longPollingTimeout > 0 && (this.ia = a.longPollingTimeout), this.ta = void 0, this.T = 0, this.P = !1, this.ja = this.B = null;
  }
  r = Zu.prototype, r.ka = 8, r.I = 1, r.connect = function(a, l, h, d) {
    Ye(0), this.W = a, this.H = l || {}, h && d !== void 0 && (this.H.OSID = h, this.H.OAID = d), this.F = this.X, this.J = Bc(this, null, this.W), wi(this);
  };
  function ca(a) {
    if (ec(a), a.I == 3) {
      var l = a.V++, h = Rt(a.J);
      if (ge(h, "SID", a.M), ge(h, "RID", l), ge(h, "TYPE", "terminate"), as(a, h), l = new Yt(a, a.j, l), l.M = 2, l.A = Ei(Rt(h)), h = !1, o.navigator && o.navigator.sendBeacon) try {
        h = o.navigator.sendBeacon(l.A.toString(), "");
      } catch {
      }
      !h && o.Image && (new Image().src = l.A, h = !0), h || (l.g = uc(l.j, null), l.g.ea(l.A)), l.F = Date.now(), mi(l);
    }
    ac(a);
  }
  function Ii(a) {
    a.g && (ha(a), a.g.cancel(), a.g = null);
  }
  function ec(a) {
    Ii(a), a.v && (o.clearTimeout(a.v), a.v = null), yi(a), a.h.cancel(), a.m && (typeof a.m == "number" && o.clearTimeout(a.m), a.m = null);
  }
  function wi(a) {
    if (!ku(a.h) && !a.m) {
      a.m = !0;
      var l = a.Ea;
      ct || E(), we || (ct(), we = !0), T.add(l, a), a.D = 0;
    }
  }
  function Hd(a, l) {
    return Vu(a.h) >= a.h.j - (a.m ? 1 : 0) ? !1 : a.m ? (a.i = l.G.concat(a.i), !0) : a.I == 1 || a.I == 2 || a.D >= (a.Sa ? 0 : a.Ta) ? !1 : (a.m = Wr(c(a.Ea, a, l), oc(a, a.D)), a.D++, !0);
  }
  r.Ea = function(a) {
    if (this.m) if (this.m = null, this.I == 1) {
      if (!a) {
        this.V = Math.floor(Math.random() * 1e5), a = this.V++;
        const v = new Yt(this, this.j, a);
        let O = this.o;
        if (this.U && (O ? (O = hu(O), fu(O, this.U)) : O = this.U), this.u !== null || this.R || (v.J = O, O = null), this.S) e: {
          for (var l = 0, h = 0; h < this.i.length; h++) {
            t: {
              var d = this.i[h];
              if ("__data__" in d.map && (d = d.map.__data__, typeof d == "string")) {
                d = d.length;
                break t;
              }
              d = void 0;
            }
            if (d === void 0) break;
            if (l += d, l > 4096) {
              l = h;
              break e;
            }
            if (l === 4096 || h === this.i.length - 1) {
              l = h + 1;
              break e;
            }
          }
          l = 1e3;
        }
        else l = 1e3;
        l = nc(this, v, l), h = Rt(this.J), ge(h, "RID", a), ge(h, "CVER", 22), this.G && ge(h, "X-HTTP-Session-Id", this.G), as(this, h), O && (this.R ? l = "headers=" + Yr(Qu(O)) + "&" + l : this.u && ua(h, this.u, O)), oa(this.h, v), this.Ra && ge(h, "TYPE", "init"), this.S ? (ge(h, "$req", l), ge(h, "SID", "null"), v.U = !0, na(v, h, null)) : na(v, h, l), this.I = 2;
      }
    } else this.I == 3 && (a ? tc(this, a) : this.i.length == 0 || ku(this.h) || tc(this));
  };
  function tc(a, l) {
    var h;
    l ? h = l.l : h = a.V++;
    const d = Rt(a.J);
    ge(d, "SID", a.M), ge(d, "RID", h), ge(d, "AID", a.K), as(a, d), a.u && a.o && ua(d, a.u, a.o), h = new Yt(a, a.j, h, a.D + 1), a.u === null && (h.J = a.o), l && (a.i = l.G.concat(a.i)), l = nc(a, h, 1e3), h.H = Math.round(a.va * 0.5) + Math.round(a.va * 0.5 * Math.random()), oa(a.h, h), na(h, d, l);
  }
  function as(a, l) {
    a.H && Ci(a.H, function(h, d) {
      ge(l, d, h);
    }), a.l && Ci({}, function(h, d) {
      ge(l, d, h);
    });
  }
  function nc(a, l, h) {
    h = Math.min(a.i.length, h);
    const d = a.l ? c(a.l.Ka, a.l, a) : null;
    e: {
      var v = a.i;
      let re = -1;
      for (; ; ) {
        const ke = ["count=" + h];
        re == -1 ? h > 0 ? (re = v[0].g, ke.push("ofs=" + re)) : re = 0 : ke.push("ofs=" + re);
        let Ce = !0;
        for (let xe = 0; xe < h; xe++) {
          var O = v[xe].g;
          const vt = v[xe].map;
          if (O -= re, O < 0) re = Math.max(0, v[xe].g - 100), Ce = !1;
          else try {
            O = "req" + O + "_" || "";
            try {
              var J = vt instanceof Map ? vt : Object.entries(vt);
              for (const [Un, tn] of J) {
                let nn = tn;
                B(tn) && (nn = Yo(tn)), ke.push(O + Un + "=" + encodeURIComponent(nn));
              }
            } catch (Un) {
              throw ke.push(O + "type=" + encodeURIComponent("_badmap")), Un;
            }
          } catch {
            d && d(vt);
          }
        }
        if (Ce) {
          J = ke.join("&");
          break e;
        }
      }
      J = void 0;
    }
    return a = a.i.splice(0, h), l.G = a, J;
  }
  function rc(a) {
    if (!a.g && !a.v) {
      a.Y = 1;
      var l = a.Da;
      ct || E(), we || (ct(), we = !0), T.add(l, a), a.A = 0;
    }
  }
  function la(a) {
    return a.g || a.v || a.A >= 3 ? !1 : (a.Y++, a.v = Wr(c(a.Da, a), oc(a, a.A)), a.A++, !0);
  }
  r.Da = function() {
    if (this.v = null, sc(this), this.aa && !(this.P || this.g == null || this.T <= 0)) {
      var a = 4 * this.T;
      this.j.info("BP detection timer enabled: " + a), this.B = Wr(c(this.Wa, this), a);
    }
  }, r.Wa = function() {
    this.B && (this.B = null, this.j.info("BP detection timeout reached."), this.j.info("Buffering proxy detected and switch to long-polling!"), this.F = !1, this.P = !0, Ye(10), Ii(this), sc(this));
  };
  function ha(a) {
    a.B != null && (o.clearTimeout(a.B), a.B = null);
  }
  function sc(a) {
    a.g = new Yt(a, a.j, "rpc", a.Y), a.u === null && (a.g.J = a.o), a.g.P = 0;
    var l = Rt(a.na);
    ge(l, "RID", "rpc"), ge(l, "SID", a.M), ge(l, "AID", a.K), ge(l, "CI", a.F ? "0" : "1"), !a.F && a.ia && ge(l, "TO", a.ia), ge(l, "TYPE", "xmlhttp"), as(a, l), a.u && a.o && ua(l, a.u, a.o), a.O && (a.g.H = a.O);
    var h = a.g;
    a = a.ba, h.M = 1, h.A = Ei(Rt(l)), h.u = null, h.R = !0, bu(h, a);
  }
  r.Va = function() {
    this.C != null && (this.C = null, Ii(this), la(this), Ye(19));
  };
  function yi(a) {
    a.C != null && (o.clearTimeout(a.C), a.C = null);
  }
  function ic(a, l) {
    var h = null;
    if (a.g == l) {
      yi(a), ha(a), a.g = null;
      var d = 2;
    } else if (ia(a.h, l)) h = l.G, xu(a.h, l), d = 1;
    else return;
    if (a.I != 0) {
      if (l.o) if (d == 1) {
        h = l.u ? l.u.length : 0, l = Date.now() - l.F;
        var v = a.D;
        d = pi(), $e(d, new Ru(d, h)), wi(a);
      } else rc(a);
      else if (v = l.m, v == 3 || v == 0 && l.X > 0 || !(d == 1 && Hd(a, l) || d == 2 && la(a))) switch (h && h.length > 0 && (l = a.h, l.i = l.i.concat(h)), v) {
        case 1:
          Hn(a, 5);
          break;
        case 4:
          Hn(a, 10);
          break;
        case 3:
          Hn(a, 6);
          break;
        default:
          Hn(a, 2);
      }
    }
  }
  function oc(a, l) {
    let h = a.Qa + Math.floor(Math.random() * a.Za);
    return a.isActive() || (h *= 2), h * l;
  }
  function Hn(a, l) {
    if (a.j.info("Error code " + l), l == 2) {
      var h = c(a.bb, a), d = a.Ua;
      const v = !d;
      d = new Xt(d || "//www.google.com/images/cleardot.gif"), o.location && o.location.protocol == "http" || Zr(d, "https"), Ei(d), v ? Ld(d.toString(), h) : kd(d.toString(), h);
    } else Ye(2);
    a.I = 0, a.l && a.l.pa(l), ac(a), ec(a);
  }
  r.bb = function(a) {
    a ? (this.j.info("Successfully pinged google.com"), Ye(2)) : (this.j.info("Failed to ping google.com"), Ye(1));
  };
  function ac(a) {
    if (a.I = 0, a.ja = [], a.l) {
      const l = Mu(a.h);
      (l.length != 0 || a.i.length != 0) && (P(a.ja, l), P(a.ja, a.i), a.h.i.length = 0, R(a.i), a.i.length = 0), a.l.oa();
    }
  }
  function Bc(a, l, h) {
    var d = h instanceof Xt ? Rt(h) : new Xt(h);
    if (d.g != "") l && (d.g = l + "." + d.g), es(d, d.u);
    else {
      var v = o.location;
      d = v.protocol, l = l ? l + "." + v.hostname : v.hostname, v = +v.port;
      const O = new Xt(null);
      d && Zr(O, d), l && (O.g = l), v && es(O, v), h && (O.h = h), d = O;
    }
    return h = a.G, l = a.wa, h && l && ge(d, h, l), ge(d, "VER", a.ka), as(a, d), d;
  }
  function uc(a, l, h) {
    if (l && !a.L) throw Error("Can't create secondary domain capable XhrIo object.");
    return l = a.Aa && !a.ma ? new Ae(new Ba({ ab: h })) : new Ae(a.ma), l.Fa(a.L), l;
  }
  r.isActive = function() {
    return !!this.l && this.l.isActive(this);
  };
  function cc() {
  }
  r = cc.prototype, r.ra = function() {
  }, r.qa = function() {
  }, r.pa = function() {
  }, r.oa = function() {
  }, r.isActive = function() {
    return !0;
  }, r.Ka = function() {
  };
  function Ti() {
  }
  Ti.prototype.g = function(a, l) {
    return new lt(a, l);
  };
  function lt(a, l) {
    je.call(this), this.g = new Zu(l), this.l = a, this.h = l && l.messageUrlParams || null, a = l && l.messageHeaders || null, l && l.clientProtocolHeaderRequired && (a ? a["X-Client-Protocol"] = "webchannel" : a = { "X-Client-Protocol": "webchannel" }), this.g.o = a, a = l && l.initMessageHeaders || null, l && l.messageContentType && (a ? a["X-WebChannel-Content-Type"] = l.messageContentType : a = { "X-WebChannel-Content-Type": l.messageContentType }), l && l.sa && (a ? a["X-WebChannel-Client-Profile"] = l.sa : a = { "X-WebChannel-Client-Profile": l.sa }), this.g.U = a, (a = l && l.Qb) && !_(a) && (this.g.u = a), this.A = l && l.supportsCrossDomainXhr || !1, this.v = l && l.sendRawJson || !1, (l = l && l.httpSessionIdParam) && !_(l) && (this.g.G = l, a = this.h, a !== null && l in a && (a = this.h, l in a && delete a[l])), this.j = new ur(this);
  }
  f(lt, je), lt.prototype.m = function() {
    this.g.l = this.j, this.A && (this.g.L = !0), this.g.connect(this.l, this.h || void 0);
  }, lt.prototype.close = function() {
    ca(this.g);
  }, lt.prototype.o = function(a) {
    var l = this.g;
    if (typeof a == "string") {
      var h = {};
      h.__data__ = a, a = h;
    } else this.v && (h = {}, h.__data__ = Yo(a), a = h);
    l.i.push(new Rd(l.Ya++, a)), l.I == 3 && wi(l);
  }, lt.prototype.N = function() {
    this.g.l = null, delete this.j, ca(this.g), delete this.g, lt.Z.N.call(this);
  };
  function lc(a) {
    Xo.call(this), a.__headers__ && (this.headers = a.__headers__, this.statusCode = a.__status__, delete a.__headers__, delete a.__status__);
    var l = a.__sm__;
    if (l) {
      e: {
        for (const h in l) {
          a = h;
          break e;
        }
        a = void 0;
      }
      (this.i = a) && (a = this.i, l = l !== null && a in l ? l[a] : void 0), this.data = l;
    } else this.data = a;
  }
  f(lc, Xo);
  function hc() {
    Zo.call(this), this.status = 1;
  }
  f(hc, Zo);
  function ur(a) {
    this.g = a;
  }
  f(ur, cc), ur.prototype.ra = function() {
    $e(this.g, "a");
  }, ur.prototype.qa = function(a) {
    $e(this.g, new lc(a));
  }, ur.prototype.pa = function(a) {
    $e(this.g, new hc());
  }, ur.prototype.oa = function() {
    $e(this.g, "b");
  }, Ti.prototype.createWebChannel = Ti.prototype.g, lt.prototype.send = lt.prototype.o, lt.prototype.open = lt.prototype.m, lt.prototype.close = lt.prototype.close, hC = function() {
    return new Ti();
  }, lC = function() {
    return pi();
  }, cC = xn, xa = { jb: 0, mb: 1, nb: 2, Hb: 3, Mb: 4, Jb: 5, Kb: 6, Ib: 7, Gb: 8, Lb: 9, PROXY: 10, NOPROXY: 11, Eb: 12, Ab: 13, Bb: 14, zb: 15, Cb: 16, Db: 17, fb: 18, eb: 19, gb: 20 }, gi.NO_ERROR = 0, gi.TIMEOUT = 8, gi.HTTP_ERROR = 6, Ji = gi, vu.COMPLETE = "complete", uC = vu, wu.EventType = zr, zr.OPEN = "a", zr.CLOSE = "b", zr.ERROR = "c", zr.MESSAGE = "d", je.prototype.listen = je.prototype.J, hs = wu, Ae.prototype.listenOnce = Ae.prototype.K, Ae.prototype.getLastError = Ae.prototype.Ha, Ae.prototype.getLastErrorCode = Ae.prototype.ya, Ae.prototype.getStatus = Ae.prototype.ca, Ae.prototype.getResponseJson = Ae.prototype.La, Ae.prototype.getResponseText = Ae.prototype.la, Ae.prototype.send = Ae.prototype.ea, Ae.prototype.setWithCredentials = Ae.prototype.Fa, BC = Ae;
}).apply(typeof vi < "u" ? vi : typeof self < "u" ? self : typeof window < "u" ? window : {});
var fe, V = (fe = class {
}, M(fe, "FOLD_CASE", 1), M(fe, "LITERAL", 2), M(fe, "CLASS_NL", 4), M(fe, "DOT_NL", 8), M(fe, "ONE_LINE", 16), M(fe, "NON_GREEDY", 32), M(fe, "PERL_X", 64), M(fe, "UNICODE_GROUPS", 128), M(fe, "WAS_DOLLAR", 256), M(fe, "LOOKBEHIND", 512), M(fe, "MATCH_NL", fe.CLASS_NL | fe.DOT_NL), M(fe, "PERL", fe.CLASS_NL | fe.ONE_LINE | fe.PERL_X | fe.UNICODE_GROUPS), M(fe, "POSIX", 0), M(fe, "UNANCHORED", 0), M(fe, "ANCHOR_START", 1), M(fe, "ANCHOR_BOTH", 2), fe);
const cr = {
  CASE_INSENSITIVE: 1,
  DOTALL: 2,
  MULTILINE: 4,
  DISABLE_UNICODE_GROUPS: 8,
  LONGEST_MATCH: 16,
  LOOKBEHINDS: 512
}, Ps = 128, Ma = new Int32Array(Ps), Ga = new Int32Array(Ps), Pi = 65535;
for (let r = 0; r < Ps; r++)
  r >= 97 && r <= 122 ? Ma[r] = r - 32 : Ma[r] = r, r >= 65 && r <= 90 ? Ga[r] = r + 32 : Ga[r] = r;
var Sa, b = (Sa = class {
  static toUpperCase(r) {
    if (r < Ps) return Ma[r];
    const e = String.fromCodePoint(r).toUpperCase(), t = e.codePointAt(0) > Pi ? 2 : 1;
    if (e.length > t) return r;
    const n = String.fromCodePoint(e.codePointAt(0)).toLowerCase(), s = n.codePointAt(0) > Pi ? 2 : 1;
    return n.length > s || n.codePointAt(0) !== r ? r : e.codePointAt(0);
  }
  static toLowerCase(r) {
    if (r < Ps) return Ga[r];
    const e = String.fromCodePoint(r).toLowerCase(), t = e.codePointAt(0) > Pi ? 2 : 1;
    if (e.length > t) return r;
    const n = String.fromCodePoint(e.codePointAt(0)).toUpperCase(), s = n.codePointAt(0) > Pi ? 2 : 1;
    return n.length > s || n.codePointAt(0) !== r ? r : e.codePointAt(0);
  }
}, M(Sa, "CODES", /* @__PURE__ */ new Map([
  ["\x07", 7],
  ["\b", 8],
  ["	", 9],
  [`
`, 10],
  ["\v", 11],
  ["\f", 12],
  ["\r", 13],
  [" ", 32],
  ['"', 34],
  ["$", 36],
  ["&", 38],
  ["'", 39],
  ["(", 40],
  [")", 41],
  ["*", 42],
  ["+", 43],
  ["-", 45],
  [".", 46],
  ["0", 48],
  ["1", 49],
  ["2", 50],
  ["3", 51],
  ["4", 52],
  ["5", 53],
  ["6", 54],
  ["7", 55],
  ["8", 56],
  ["9", 57],
  [":", 58],
  ["<", 60],
  [">", 62],
  ["?", 63],
  ["A", 65],
  ["B", 66],
  ["C", 67],
  ["F", 70],
  ["P", 80],
  ["Q", 81],
  ["U", 85],
  ["Z", 90],
  ["[", 91],
  ["\\", 92],
  ["]", 93],
  ["^", 94],
  ["_", 95],
  ["`", 96],
  ["a", 97],
  ["b", 98],
  ["f", 102],
  ["i", 105],
  ["m", 109],
  ["n", 110],
  ["r", 114],
  ["s", 115],
  ["t", 116],
  ["v", 118],
  ["x", 120],
  ["z", 122],
  ["{", 123],
  ["|", 124],
  ["}", 125]
])), Sa), p = class {
  /**
  * @param {Uint32Array | number[]} data
  * @param {boolean} isStride1
  */
  constructor(r, e = !1) {
    this.data = r, this.isStride1 = e, this.SIZE = e ? 2 : 3;
  }
  getLo(r) {
    return this.data[r * this.SIZE];
  }
  getHi(r) {
    return this.data[r * this.SIZE + 1];
  }
  getStride(r) {
    return this.isStride1 ? 1 : this.data[r * this.SIZE + 2];
  }
  get length() {
    return this.data.length / this.SIZE;
  }
};
const CC = /* @__PURE__ */ new Uint8Array(256);
for (let r = 0, e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-"; r < 64; r++) CC[e.charCodeAt(r)] = r;
const fC = (r) => {
  const e = [];
  let t = 0, n = 0;
  for (let s = 0; s < r.length; s++) {
    let i = CC[r.charCodeAt(s)];
    t |= (i & 31) << n, (i & 32) === 0 ? (e.push(t), t = 0, n = 0) : n += 5;
  }
  return e;
}, g = (r, e) => {
  const t = fC(r), n = e ? t.length / 2 : t.length / 3, s = new Uint32Array(n * 3);
  let i = 0, o = 0;
  for (let B = 0; B < n; B++)
    i += t[o++], s[B * 3] = i, i += t[o++], s[B * 3 + 1] = i, s[B * 3 + 2] = e ? 1 : t[o++];
  return s;
}, FE = (r) => {
  const e = fC(r), t = /* @__PURE__ */ new Map();
  let n = 0;
  for (let s = 0; s < e.length; s += 2) {
    n += e[s];
    const i = e[s + 1], o = i >>> 1 ^ -(i & 1);
    t.set(n, n + o);
  }
  return t;
};
var Si = class {
  constructor(r) {
    this.initializer = r, this.cache = /* @__PURE__ */ new Map();
  }
  has(r) {
    return r in this.initializer;
  }
  get(r) {
    if (this.cache.has(r)) return this.cache.get(r);
    const e = this.initializer[r], t = e ? e() : null;
    return this.cache.set(r, t), t;
  }
}, on, nt = (on = class {
  static get CASE_ORBIT() {
    return this._CASE_ORBIT || (this._CASE_ORBIT = FE("rCgCIgCY+rQI4QiCuuBLgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCCgCBgCBgCBgCBgCBgCBgCB+7OB-BB-BB-BB-BB-BBskQB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BC-BB-BB-BB-BB-BB-BB-BByHBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBDCBBBCBBBCBBCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBxHBCBBBCBBBCBBB3SBmMBkNBCBBBCBBB8MBCBBB6MB6MBCBBC+EB0MB2MBCBBB6MB+MBiGBmNBiNBCBBBmKBikzCBmNBqNBkIBsNBCBBBCBBBCBBB0NBCBBB0NDCBBB0NBCBBByNByNBCBBBCBBB2NBCBBDCBBCwDFCBCBDBCBCBDBCBCBDBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBB9EBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCCBCBDBCBBBhGBvDBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBjICCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBH2iVBCBBBlKBwiVB+jVB+jVBCBBBlMBqEBuEBCBBBCBBBCBBBCBBBCBBB+hVB4hVB8hVBjNB7MC5MB5MCzMC1MB+0yCE5MB20yCC9MBu2yCBwyyCBo0yCChNBlNBo0yCBu-UBi0yCDlNC6-UBpNDrNIu+UDzNCm0yCBzNE0yyCBzNBpEBxNBxNBtEG1NLqxyCBkxyCnFoFrBCBBBCBBDCBBEkIBkIBkICoHHsCCqCBqCBqCCgEC+DB+DBmkOBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCC+BBgCBgCBgCBgCBgCBgCBgCBgCBrCBpCBpCBpCBmjOB-BB8BB-BB-BBgEB-BB-BByBBqgOBsDB-BBtwBB-BB-BB-BBsBBgDBCB-BB-BB-BBeB-BB-BB61OB-BB-BB-DB9DB9DBQB7DBmCE9CBrDBPBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBrFB-EBOBnHB3FB-FCCBBBNBCBBCjIBjIBjIBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB8kMB-BB6kMB-BB-BB-BB-BB-BB-BB-BB-BB-BBokMB-BB-BBkkMBkkMB-BB-BB-BB-BB-BB-BB-BB4jMB-BB-BB-BB-BB-BB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EBCBBBCBoiMBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBJCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBeBCBBBCBBBCBBBCBBBCBBBCBBBCBBBdBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDL-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-C64CgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOCgmOGgmODg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FDg8FBg8FBg8FhVg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBQBQBQBQBQBQDPBPBPBPBPBPjkC7mMB5mMBnmMBjmMBCBlmMB3lMBpiMBk8kCBCBBG-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FD-7FB-7FB-7F6FoglCEsuHRwjlCyDCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCB0DBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBG1DD97OCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQDPBPBPBPBPBPDQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQDPBPBPBPBPBPEQCQCQCQCPCPCPCPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPB0EB0EBsFBsFBsFBsFBoGBoGBgIBgIBgHBgHB8HB8HDQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQCSFPBPBzEBzEBRCxnOFSFrFBrFBrFBrFBREQBQClkOFPBPBnGBnGFQBQCljOCODPBPB-GB-GBNHSF-HB-HB7HB7HBRqJ53OE9tQBrmQH4Bc3BSgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBfBfBfBfBfBfBfBfBfBfBfBfBfBfBfBfECBByZ0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzB34BgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CBCBBBt-UBruHBt+UB1iVBviVBCBBBCBBBCBBB3hVB5-UB9hVB7hVCCBBCCBBI9jVB9jVBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBICBBBCBBECBBN-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOC-lOG-lOzoeCBBBCBBBCBBBCBBBCBBBCBl8kCBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBTCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBnECBBBCBBBCBBBCBBBCBBBCBBBCBBDCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBKCBBBCBBBnglCBCBBBCBBBCBBBCBBBCBBECBBBvyyCDCBBBCBBBgDCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBn0yCB90yCB10yCBh0yCBn0yCCjxyCBzyyCBpxyCBg6BBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBB-CBl0yCBvjlCBCBBBCBBBt2yCBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBhkzCZCBB9a-5Bd-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCm6TCBB7gBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCH-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BmlBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvChDwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCFvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvC1DuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCCuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCCuCBuCBuCBuCBuCBuCBuCCuCBuCCtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCCtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCCtCBtCBtCBtCBtCBtCBtCCtCBtCk2BgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEO-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-D+CgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCL-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-B74CgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BhrVgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BhB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BD1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BtxekCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjC")), this._CASE_ORBIT;
  }
  static get Print() {
    return this._Print || (this._Print = new p(g("hB9CBjBLBCpWBDFBFGBCCCBSBCsMBClBBDxBBDCBC2BBJaBFFBSVBC-FBCvBBD6BBDkDBP6BBDwBBDOBCbBDCCBJBGfBIqCBCgFBCHBDBBDVBCGBCEEBCBDIBDBBDDBJFFBCCBDBDYBDCBCFBFBBDVBCGBCBBCBBCBBDCCBDBFBBDCBEIIBCBCIIBPBLCBCIBCCBCVBCGBCBBCEBDJBCCBCCBDQQBCBDLBIGBCCBCHBDBBDVBCGBCBBCEBDIBDBBDCBICBFBBCEBDRBLBBCFBECBCDBEBBCCCBEEBEEBBBELBFEBECBCDBDHHPUBGMBCCBCWBCPBDIBCCBCDBIBBCCBCBBDDBDJBIVBCCBCWBCJBCEBDIBCCBCDBIBBGCBCDBDJBCCBNMBCCBCyBBCCBCFBFPBDZBCCBCRBEXBCIBCDDBFBEFFBEBCCCBGBHJBDCBN5BBFcBmBBBCCCBDBCXBCCCBVBDEBCCCBFBCJBDDBhBnCBCjBBFmBBCjBBCOBCMBmBlGBCGGD4LBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBDfBEZBH1CBDFBD-TBCbBE4CBIVBKXBKTBNMBCCBCBBN9CBDJBHJBHNBCKBH4CBIqBBGlCBLeBCLBFLBFEEBoBBDEBMrBBFZBHKBE9BBDgCBCcBDKBHJBHNBDtBBDLBVsCBClFBJ7BBEOBE9BBGqBBDKBJqBBG1QBDFBDlBBDFBDHBCGCBdBD0BBCOBCNBDFBCSBDCBCIBSXBJuBBSBBDaBCMBEhBBPgBBQrEBF5UBXKBWz4BBD9LBGsBBCGGD3BBIBBPXBKGBCGBCGBCGBCGBCGBCGBCGBC9DBjBZBC4CBN1GBbPBC+BBC1CBDmDBGqBBC9CBC1CBKvBBCszcBE2BBK7KBV3FBJ8GBV7BBEJBH3BBJlCBJLBHzDBMdBEtCBCKBFgBBC2BBKNBDJBDmDBZbBLFBDFBDFBKGBCGBC7BBF9DBDJBHj9KBNWBFwBBloItLBDpDBnBGBNEBGZBCEBCCCBCCBCCBoUBhBpBBHyBBCSBCDBFEBCmEBF9FBEFBDFBDFBDCBEGBCGBOBBDLBCZBCSBCBBCOBDNBjB6DBGCBFsBBE3CBCMBEwBwBBsBBjEcBEwBBQbBFjBBKdBGqBBGdBCkBBFNBrB9EBDJBHjBBFjBBFnBBJzBBMLBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBCnCBJIBxBSBCBBGgBBEaBGaBnB3BBFTBDxBBCBBGHBCCBCcBDCBFJBIIBI-BBhBmBBFLBK1BBEcBDaBGZBIDBNGBxCoCB4ByBBOyBBItBBJJBHlBBEcBJBBxGeBCpBBCCBDBBRFBJIBiBtBBJpBBXZBnBbBVWBKtCBFjBBK9BBCEBOYBIJBH0BBCRBJmBBK-CBCTBMRBCuBB-BGBCCCBCBCOBCKBH6BBGJBHDBCHBDBBDVBCGBCBBCEBCJBDBBDCBDHHGGBDGBEEBMJBCDDClBBCJBCDDCDBCJBCBBJBBe7CBCEBfnCBJJBnF1BBDlBBjBkCBMJBHMBU5BBHJBHTBdaBDOBFWB6F7BBlDyCBNHBDDDBGBCBBCdBCBBDLBKJBnCHBDtBBDKBcnCBJyCBOoCBIJB3CHB5ChBBPJBHIBCsBBCNBLcBEfBDVBCNBqCGBCBBCrBBECCBCCBHBJJBHFBCBBCkBBCBBCFBIJBHrBBFJB3HYBIQBCoBBEcB2CQQBwBBO6cBnDuDBCEBMjGBtyCiDBOvhBBRVBL68DBGmSB61G5BBn2B4RBIeBCJBFwCBCJBHdBDFBLlCBLJBCGBCUBGSBxN5BBnG6CBGYBDYBtBqCBF4BBIQBhCEBMGBK1mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBDDBh7D8HBEzNBHWBQQBQtBBDWBKzDB9B1HBLmBBDpCBJvDBWlCB7DTBNTBN2CBKYBoE0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBD9VBQEBCOBxiBeBHFB2GGBCQBDGBCBBCEBG9BBiBxDxDBrBBENBDJBFBBhKeBS5BBGxOxOBoBB3GqBBFhGhGBdBCVBJBBhHGBCDBCBBCOBCkGBDPBqBrCBFJBFBByYjCBtC8BBjGDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBBvIrBBFjDBNOBDOBCOBCkBBLtFB5BcBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBCmDBmgB-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIBnkzVvHB", !1))), this._Print;
  }
  static get Upper() {
    return this.CATEGORIES.get("Lu");
  }
}, M(on, "_CASE_ORBIT", null), M(on, "_Print", null), M(on, "CATEGORIES", new Si({
  C: () => new p(g("AfBgDgBBOrWrWBHHBCBICCVuMuMnBBBzBBBE4B4BBGBcDBHQBXhGhGxBBB8BBBmDNB8BBByBBBQddBCCMEBhBGBsCiFiFJBBDBBXIICCBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBPMMBEB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKMMBDBbEByBPBDBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBjoIBvLBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCB-FCBHBBHBBHBBECBIIIBLBDBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIB-BGGBLBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMBxhBPBXJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBF-6DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBrCHBxDUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIlkzVBxHvw-FB", !1)),
  Cc: () => new p(g("AfgDgB", !0)),
  Cf: () => new p(g("tFzqBzqBBEBXhGhGyBhMhMBxCxCs5D9-B9-BBDBbEByBEBCJBw03B6H6HBBBimEQQj7IPBhjiBDBwmFHBn0rYffB+CB", !1)),
  Cn: () => new p(g("4bBBHDBICCVuMuMnBBBzBBBE4B4BBGBcDBHKBvI9B9BBmDmDBMB8BBByBBBQddBCCMEBjBEBuHJJBDDBXXICCBBBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBbFB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKmDmDNBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBDBvzIBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCC-FCBHBBHBBHBBECBIIIBIBGBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIBlCJBCBBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMB3iBJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBJ76DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBjGUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIm8yVBCdBhD-DBxHvw-BB---BBB---BBB", !1)),
  Co: () => new p(g("gg4B-nGh4hc9--BD9--B", !0)),
  Cs: () => new p(g("gg2B--B", !0)),
  L: () => new p(g("hCZBHZBwBLLFGGBVBCeBCpOBFLBPEBICCiEEBCBBDDBCHHCCBCCCBSBCyCBCqEBJlFBClBBDHHBnBBoCaBFDBuBqBBkBBBCiDBCQQBIIBLLBBBDRRCdBe4CBMZZBfBKBBFGGBUBFKKEYYBXBIKBGXBCGBRpBB7B1BBETTIJBQPBFHBDBBDVBCGBCEEBCBERROBBCCBPBBLJJBEBFBBDVBCGBCBBCBBCBBgBDBCUUBBBRIBCCBCVBCGBCBBCEBETTQBBYMMBGBDBBDVBCGBCBBCEBEffBCCBBBQSSCFBECBCDBEBBCCCBEEBEEBBBELBX1B1BBGBCCBCWBCPBEbbBBBCBBDBBfFFBGBCCBCWBCJBCEBEffBBBCBBQBBSIBCCBCoBBDRRGCBJCBZFBGRBEXBCIBCDDBFB7BvBBCBBNGB7BBBCCCBDBCXBCCCBIBCBBKDDBDBCWWBCBhBgCgCBGBCjBBcEB0DqBBVRRBEBFDBEEEBIIBBBFMBNSSBkBBCGGDqBBCsKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPBR1CBDFBErTBDQBCZBGqCBHHBIRBOSBPRBPMBCCBQzBBkBFFkC4CBIEBDhBBCGGBkCBLeByBdBDEBMrBBFZB3BWBK0BBzC+C+CBtBBSHB3BdBOBBLrBBbjBBqBCBLjBBDKBGqBBDCBqBDBCFBCBBEGGB+FBhC1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGB1DOORMBmDFFDJBCEEBDBHGCBCBCKBDDBGEBF1B1BB8zC8zCBjHBHDBEBBNlBBCGGD3BBIRRBVBKGBCGBCGBCGBCGBCGBCGBCGBxC2O2OBrBrBBDBGBBF1CBHCBC5CBCDBGqBBC9CBSfBxBPBhQ-tGBhCs0VBkCtBBDsIBEPBLBBVuBBReBDlCByBIBDmDBDxCBVQBCCBCDBCWBezBBPxBB-BFBECCBMMBaBLWBacBIuBBdRRBDBCJBLEBCoBBYCBCHBVWBEEEBwBBCEEBDDBDBDCCZCBDKBICBNFBDFBDFBKGBCGBCqBBCNBHyDBej9KBNWBFwBBloItLBDpDBnBGBNEBGCCBIBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBlBZBHZBM4CBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmMcBEwBBwBfBOTBCHBHlBBLdBDjBBFHBxB9EBTjBBFjBBFnBBJzBBNKBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCQQBCBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4ByBBOyBBOjBBnBbBKWB7HpBBHBBRFB5BcBLJJBUBrBRBvBUBcWBN0BB6BBBDOOBrBBhBYBbjBBeDDJiBBENNBuBBPDBWCCkBRBCYBUBBgCGBCCCBCBCOBCJBIuBBnBHBDBBDVBCGBCBBCEBETTNEBfJBCDDClBBCaaCtBtBBzBBTDBVCBfvBBVBBC5F5FBtBBqBDBlBvBBV8B8BBpBBOoCoCBZBmBGB6FrBB1D-BBgBHBDDDBGBCBBCXBQCC-CHBDmBBRCCdLLBmBBIWWMtBBUTTBnCBoGgBBgBIBCkBBSyByBBcBxDGBCBBClBBWaaBEBCBBCfBPYYBqBBlISBQCCBLBChBB9DwCwCB4cBnHjGBtyCgDBQvhBBSFBa68DBGmSB61GdBj3B4RBIeBSuCBSdBTvBBRDBgBUBGSBxNsBB0G-BBhBYBDYBtBqCBGjCjCBLBhCBBCPPBNNB0mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBn7F0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BeBHFBmI9BBzEsBBLGBRiKiKBcBTrBBlPbBlHdBDwGwGBdBCCBCBBCGBDEBKBBhHGBCDBCBBCOBCkGB8BjCBI1lB1lBBCBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQBlqE-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB", !1)),
  LC: () => new p(g("hCZBHZB7BLLBVBCeBCiGBCDBFvGBDZBhGDBDBBECBCHHCCBCCCBSBCyCBCqEBJlFBClBBKoBB44ClBBCGGDqBBDCBhV1CBDFBjkCKBGqBBDCBhCrBBgCMBChBBmD1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGBmIFFDJBCEEBDBHGCBCBCFBFDDBCBGEBF1B1BB8zC8zCB6DBDmDBHDBEBBNlBBCGGzoetBBTbBnEtCBCWBEDBCsCBZBBE2Z2ZBpBBGIBIvCBh6TGBNEBqgBZBHZBmlBvCBhDjBBFjBB1DKBCOBCGBCBBCKBCOBCGBCBBk2ByBBOyBB+CVBLVB74C-BBhrV-BBhBYBDYBtpZ0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BJBCTBHFB2uCjCB", !1)),
  Ll: () => new p(g("hDZB7BqBqBBWBCHBC2BCBQCBuBCDECBBBDCCDEEBFFDEEBBBDDDCCCDCCBCCDEECDDBDDBBBHGDCOCBSCBDDCEEC4BCBFBDDDBCCFICBjCBDZBiGCCEEEBBBTccBhBBCBBECBCWCBDBCGDB0B0BBuBBCgBCK0BCDMCBgDCxBoBBo6CqBBDCB5XFBjkCIBC2D2DBqBBgCMBChBBnD0ECBHBCgDCBHBJFBLHBJHBJFBLHBJHBJNBDHBJHBJHBJEBCBBHEEBBBCBBJDBDBBJHBLCBCBBzIEEBEEcKFDBBJDBF2B2Bs1CvBBCEEBGCFCCBCCBEBGiDCBIICFFNlBBCGG0oesBCUaCoEMCBBBC+BCBGBCCCDICFCCDCCBBBCSCGGGCMCFCCDOCbEE2ZqBBGIBIvCBh6TGBNEBqhBZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBnqZZBbGBCRBbZBbDBCCCBFBCKBbZBbZBbZBbZBbZBbZBbZBbZBbbBdYBCFBbYBCFBbYBCFBbYBCFBbYBCFBC15B15BBIBCTBHFB4vChBB", !1)),
  Lm: () => new p(g("wVRBFLBPEBICCmEGG-OnHnHlFBBuIBBFgBgBKEEhFoFoF1mBgEgE2R72B72BsDkTkTxOFBvF+BBOjBjBBjBByVOORMBg-CBByHgGgG2OsBsBBDBGiDiDB+C+CBBB34bjnBjnBBEBvIzDzDdBB6DIBxCYYpDDBEBB2OXXqEtDtDWBBoDDBKngVngVuBBBh-BFBCpBBCIB0sBhBhB2K04D04DnrTDB9PCBpBBBnRMBhCBBCPPB9-P9-PBCBCGBCBByhM9BBqGGBud0Q0QsSAB", !1)),
  Lo: () => new p(g("qFQQhIFFBCBxGBB7ZaBFDBuBfBCJBkBBBCiDBCZZBLLBBBDRRCdBe4CBMZZBfBWVBrBYBIKBGXBCGBRoBB8B1BBETTIJBROBFHBDBBDVBCGBCEEBCBERROBBCCBPBBLJJBEBFBBDVBCGBCBBCBBCBBgBDBCUUBBBRIBCCBCVBCGBCBBCEBETTQBBYMMBGBDBBDVBCGBCBBCEBEffBCCBBBQSSCFBECBCDBEBBCCCBEEBEEBBBELBX1B1BBGBCCBCWBCPBEbbBBBCBBDBBfFFBGBCCBCWBCJBCEBEffBBBCBBQBBSIBCCBCoBBDRRGCBJCBZFBGRBEXBCIBCDDBFB7BvBBCBBNFB8BBBCCCBDBCXBCCCBIBCBBKDDBDBYDBhBgCgCBGBCjBBcEB0DqBBVRRBEBFDBEEEBIIBBBFMBNyDyDBnKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPByDrTBDQBCZBGqCBHHBIRBOSBPRBPMBCCBQzBBpBkCkCBhBBC0BBIEBDhBBCGGBkCBLeByBdBDEBMrBBFZB3BWBK0BBxFuBBSHB3BdBOBBLrBBbjBBqBCBLdByDDBCFBCBBE7hB7hBBCB4-C3BBZWBKGBCGBCGBCGBCGBCGBCGBCGBoR2B2BF1CBJCCB4CBFGGBpBBC9CBSfBxBPBhQ-tGBhC0wUBC2jBBkCnBBJrIBFPBLBBjCyByBBkCBqFoDoDEGBCCBCDBCWBezBBPxBB-BFBECCBMMBaBLWBacBIuBBuBEBDIBLEBCoBBYCBCHBVPBCFBEEEBwBBCEEBDDBDBDCCZBBEKBIPPBEBDFBDFBKGBCGByEiBBej9KBNWBFwBBloItLBDpDBkCCCBIBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBqDJBCsBBDeBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmMcBEwBBwBfBOTBCHBHlBBLdBDjBBFHBhEtCBjDnBBJzBB9CzBBN2JBKVBLHB5EFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCQQBCBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4FjBBnBDBCxJxJBoBBHBBRCBCBB5BcBLJJBUBrBRBvBUBcWBN0BB6BBBDOOBrBBhBYBbjBBeDDJiBBENNBuBBPDBWCCkBRBCYBUBBgCGBCCCBCBCOBCJBIuBBnBHBDBBDVBCGBCBBCEBETTNEBfJBCDDClBBCaaCtBtBBzBBTDBVCBfvBBVBBC5F5FBtBBqBDBlBvBBV8B8BBpBBOoCoCBZBmBGB6FrBB0GHBDDDBGBCBBCXBQCC-CHBDmBBRCCdLLBmBBIWWMtBBUTTBnCBoGgBBgBIBCkBBSyByBBcBxDGBCBBClBBWaaBEBCBBCfBPYYBnBBCBBlISBQCCBLBChBB9DwCwCB4cBnHjGBtyCgDBQvhBBSFBa68DBGmSB61GdBj3B4RBIeBSuCBSdBTvBB0BUBGSB0NnBB2MqCBGwFwFB0mHBqBfBiDyDBuwIiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBxzI2P2PBrBBiBiKiKBcBTrBBlPaBmHdBDwGwGBdBCCBCBBCGBDEBKiHiHBFBCDBCBBCOBCkGB8pBDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQBlqE-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB", !1)),
  Lt: () => new p(g("lOGDnB2sH2sHBGBJHBJHBNQQwBAB", !1)),
  Lu: () => new p(g("hCZBmDWBCGBiB2BCDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIJDCMCDQCDDDCCBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBDDBBBEWCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBpCDBNDBNDBNEBMDBnIFFECBDCBDEEBDBHGCBCBDDBLBBG+B+B9zCvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoqZZBbZBbZBbCCBGDBDDBCBCHBbZBbBBCDBDHBCGBcBBCDBCEBCEEBFBcZBbZBbZBbZBbZBbZBfYBiBYBiBYBiBYBiBYBiB2pE2pEBgBB", !1)),
  M: () => new p(g("gYvDB0IGBoIsBBCCCBCCBCCpCKBxBUBRmDmDBFBDFBDBBCDBkBffBZB8CKB7BIBKZZBCBCIBCCBCEBsBCB8BIBrBXBCgBB3BCBCRBCGBLBBeCB5BCCBFBDBBDCBKLLBbbDCB5BCCBDBFBBDCBEffBEEMCB5BCCBGBCCBCCBVBBXFBCCB5BCCBFBDBBDCBICBLBBf8B8BBDBECBCDBKpBpBBDB4BCCBFBCCBCDBIBBMBBeCB5BCCBFBCCBCDBIBBMBBQNNBCB4BBBCGBCCBCDBKLLBeeBBBnCFFBEBCCCBGBTBB+BDDBFBNHBjDDDBHBMGBqCBBcECFBByBTBCBBGKBCjBBKlDlDBSBYDBFCBCCBDGBEDBOLBCLLBCBgWCBzdDBdCBeBBfBBhCfBKuBuBBBBC2D2DBjBjB3DLBFLB8GEB6BJBCcBDxBxBBsBBDLBVEBwBQBnBIBNCBfMB5BNBxBTB5ECBCUBFHHDCBnG-BBxWgBB--CCBuEhDhDBeBrRFBqDBB1udDBCJBhBBBxCBBxIEEFYYBDBF0C0CBzBzBBQBbRBOnBnBBGBaMBtBDBwBNBlBkCkCBMBNJJBuBuBBBBzBCCBBBDBBGBBCqBqBBDBGBBtHHBCBBx5TiXiXBOBRPBuejHjH2EEBn0BCBCBBGDBpBCBFmFmFB+R+RBCBiCEB+JBBuCFBnCKByBDB7DCB2BOBqBDDBLLBCBuBKBI+B+BBBBlBNBRBBtBNNBBBxBNBJDBCBB9CLBHDD+ELBWDB4BBBCGBDBBDCBKLLBDDBFBEEBkCIBCDDCDBCEBCPPBzCzCBQBYyCyCBSBsHGBDIBcBBzCQBrDMBmDOBhIOB2HFBCBBDDBCCCBuEuEBFBDGBEddBIBpBGBCDBJKKBJBvBPBnGHBoGHBCHBzCVBCNB7DFBECCBCCBFBCjCjCBDBCBBCEB8KDBKBBCxBxBBFBEEBYmnFmnFHOBpmLRBhuCEB8BGB5gBCCB1BBIDByCMMBslTslTBizEizEBsBBDWB-QEBEFBJHBDGBfDB1ECB89B2BBFxBBJPPXEBCOBxqBGBCQBDGBCBBCEBlDhFhFBFB4L+B+BBCB9PDB-HBB0HDDIBBG7O7OBFBuDGB29lYvHB", !1)),
  Mc: () => new p(g("joC4B4BDCBJDBCBBzBBB7BCBHBBDBBLsBsB7BCBjC7B7BBBBJCCB2B2BB7B7BCHHBDDBLLnDBBCBBECBCCBLqBqBBBB+BDB+BBB7BCCBDBDBBCBBKBBdPPB7B7BBBBGCBCCBLrBrBBsCsCBBBHHBTBBrKBBgCsFsFBFFHDDBaaBLLBBBDGBWBBDFBDLLBBB5zBffiEIIBGBCBB7KDBDCBFBBCFBhHBB7BCCKCCBJJBEByExBxBGCCBDBCBB+BffFBBD9B9BDCBCEEBxBxBBGBJBBsFWW35EBB0-dBBD5C5CBzBzBBOBvEBBwBxBxBBFFBDDBBBvDBBDBBZuBuBCuDuDDBBGuHuHBCCBCCBCC0gZCCgEuBuBBBBFBB0DZZB8B8BxBCBKBBO+C+CBBBEBBCrFrFBBBgBBB7BBBCDBDBBDCBKLLB1C1CBBBIDDCDBCBBCmDmDBBBJBBErDrDBBBHCCBCBDuHuHBBBHDBDyDyDBBBJBBCuDuDCBBHoDoDCBBFmImIBBBK4H4HBEBCBBFDDCvEvEBBBJDBF1C1CeBB-BqGqGECCoGPPrDIID2G2GBDBFBBC-K-KBNNxBBBJBBCpvQpvQBBBlxD2BBpDBB0rYBBHFB", !1)),
  Me: () => new p(g("okBBB1xF-wB-wBBCBCCBsshBCB", !1)),
  Mn: () => new p(g("gYvDB0IEBqIsBBCCCBCCBCCpCKBxBUBRmDmDBFBDFBDBBCDBkBffBZB8CKB7BIBKZZBCBCIBCCBCEBsBCB8BIBrBXBCfB4BCCFHBFEEBFBLBBe7B7BFDBJVVBbbDBB6BFFBFFBDDBBBEffBEEMBB6BFFBDBCBBFVVBXXBEBC7B7BDCCBCBJIIBMMBff+BNNzBEE4BCCBBBGCBCDBIBBMBBe7B7BDHHGBBVBBdBB6BBBFDBJVVBeepCIIBBBC7C7CDGBNHBjDDDBHBMGBqCBBcEC4BNBCEBCBBGKBCjBBKnDnDBCBCFBCBBDBBaBBFCBRDBODDBHHQgWgWBBBzdCBeBBfBBfBBhCBBCGBJDDBJBKuBuBBBBC2D2DBjBjB3DCBFBBKHHBBB8GBBD7B7BCGBCCCDHBHJBDxBxBBMBCeBDLBVDBxBCCBDBCGGpBIBNBBhBDBDBBCCB5BCCBEECCB7BHBDBB5ECBCMBCGBFHHEBBnG-BBxWMBFEEBKB--CCBuEhDhDBeBrRDBsDBB1udFFBIBhBBBxCBBxIEEFaaBGG4EBBbRBOnBnBBGBaKBvBCBxBDDBCBDBBoBkCkCBEBDBBDBBNJJwB0B0BCCBDBBGBBCrBrBBJJvHDDFx5Tx5TiXPBRPBuejHjH2EEBn0BCBCBBGDBpBCBFmFmFB+R+RBCBiCEB+JBBuCFBnCKByBDB8D3B3BBNBqBDDBLLBBByBDBDBBI+B+BBBBlBEBCHB-BNNB1B1BBHBLDBDgDgDBBBDCCBHHD+E+EEHBWBB6BBBEmBmBBFBEEBnCFBOECPBB2CHBDCBCYY1CFBCFFBCCBvHvHBCBHBBCBBcBB2CHBDCCBrDrDCDDBEBCmDmDCDDBCBCEBkIIBCBBhIBBCFFxEDBDBBFhBhBBIBpBFBDDBJKKBEBDCBvBMBCBBnGCCBBBCqGqGBFBCFBCzCzCBUBDGBCBBCBB7DFBECCBCCBFBCpCpCBEEC8K8KBMMB1B1BBDBGCCYmnFmnFHOBpmLLBECBhuCEB8BGB5gBgCgCBCByC5lT5lTBizEizEBsBBDWBhRCBSHBDGBfDB1ECB89B2BBFxBBJPPXEBCOBxqBGBCQBDGBCBBCEBlDhFhFBFB4L+B+BBCB9PDB-HBB0HDDIBBG7O7OBFBuDGB29lYvHB", !1)),
  N: () => new p(g("wBJB5DBBGDDBBBitBJBnEJBnGJB9MJB3DJBFFBtDJB3DJB3DJBDFBvDMB0DJBJGBoDJBpDGBISBuDJBhDJB3DJBnCTBtIJBnCJBwWTBybCBwHJBHJBXJBtJJBhEKBmFJBHJB3FJB3CJBnEJBHJB3gBEEBEBHJBnGyBBDEB3W7BBvCVB3TdBqrBqYqYaIBPCB4KDBrEJBfHBCOBhBJBoBOBh7cJB9FJBhKFB7EJBnBJBnGJBXJB3CJB3MJB34UJBuPsBBN4BBSBB2KaBlBDBeJJnEEBrGJBvdHBaGBoBIBsCEBXFBhFBBDPBDtBBhCIB1BBBfCBsCEBpDHBZHBqBGBrKFBxBJBHJB3IeB-EJBrBDBxDGBnEdBhEJB9BJBxEJBITB8HJB3KJB3DJB3LJBnDJBHTBtCLBlNSB+CJB3UJB3CcBkHJBnCJB3BJBnLJBnDUBshBuDBimPJBnpCJB3CJBnEJBCGBvQJBnIWB+KCB6nXJBnuBTBNTBtDYB2iBxBBhqCJBnNJB3PJB4HJBtWIBhEJB4Y6BBCCBCDBtCsBBCOBjeMBk3CJB", !1)),
  Nd: () => new p(g("wBJnxBJnEJnGJ9MJ3DJ3DJ3DJ3DJ3DJ3DJ3DJ3DJ3DJhDJ3DJnCJ3IJnCJn6BJnBJtJJhEJnFJHJ3FJ3CJnEJHJnuiBJnVJnBJnGJXJ3CJ3MJ34UJnsBJnkCJHJ9YJhEJ9BJxEJ3IJ3KJ3DJ3LJnDJHTtCJnNJnDJ3UJ3CJ3HJnCJ3BJnLJ3uQJnpCJ3CJnEJ3QJ37XJ12CxBhqCJnNJ3PJ4HJ2aJ30EJ", !0)),
  Nl: () => new p(g("u3FCBwzCiBBDDB-zDaaBHBPCBs1dJBxyW0BBtOJJnEEBrhIuDBm8SCB", !1)),
  No: () => new p(g("yFBBGDDBBB2pCFB5LFB5DCBmEGB6GGBSIByNJB2hBTB0jBJBhP20B20BEFBHJBnGPBqB3W3WB6BBvCVB3TdBqrB1kB1kBBCBrEJBfHBCOBhBJBoBOBxrdFBymWsBBiCDBSBB2KaBlBDB1pBHBaGBoBIBsCEBXFBhFBBDPBDtBBhCIB1BBBfCBsCEBpDHBZHBqBGBrKFBhLeB-EJBrBDBxDGBnETB8LTBmqBBBvNIBobSB0aUBn8SGB-YWBqhZTBNTBtDYBvqFIBid6BBCCBCDBtCsBBCOBjeMB", !1)),
  P: () => new p(g("hBCBCFBCDBLBBEBBbCBCccCkBkBGEELBBEEE-VJJzOFBqBBB0BCCDDDtBBBVBBCBBOCCBBBrCDBnDsBsBBMBqHCB3BOBgBmImIBLLtE5D5D6DnMnMNwLwL7CLLBpFpFBNBCmBmBBCBoCrCrCBDBFBBwDFBsFlTlTBHB4EuTuTtBBBvCCBoCBB+ECBCCBmBKB6JBB5GBBhEGBCFBhFBBLGBdCB9DDB8BEB-BBBhCHBM9Z9ZBWBJTBCMBCLBfBBPBB6TDBeBB+hBNBwCBBgBJB0MVBgCDBhBBB8XDBCBBxDwEwEBtBBCfBDLBkNCBFJBDLBRNNjD7C7CjgdBBuICBkDLL0DFB9LDB3CBBpBCBCyByBBwBwBiDMBRBB9DDB-DBBRBB6HzqUzqUBxGxGBIBXiBBCNBCFFCBB2ECBCFBCDBLBBEBBbCBCccCCCBFB7MCB9UxBxB-MoXoXoGgBgBxIIBnBxDxDBFBjCGB6CDByO-J-JjBlElEBDBtBDB+FGBuDBBCDB-DDBxBBBwCDBFOOCCB5CFBsDrJrJBCCBzDzDBDBLBBCpDpD7HWBqDCBdMBtCjEjEBBB9HpIpIBBB8E9C9CBGB0CCBCEB+CJB4GgDgDBDBrBBBmUBBrCMBwFxjBxjBBDB97CBB8zOBBmEiCiCBDBJpRpRBBBoJDBoK9lT9lTovHEB07C-a-aBAB", !1)),
  Pc: () => new p(g("-Cg-Hg-HBUU-u3BBBZCBwHAB", !1)),
  Pd: () => new p(g("tB9qB9qB0BiyDiyDmgBqgCqgCBEBiwDDDgBBBFdd-NUUwDxszBxszBBmBmBLqFqFhzD-J-J", !1)),
  Pe: () => new p(g("pB0B0BgB+1D+1DC-6B-6BqtC4B4BQ7T7TCff-hBMCxChBhBCGC1MUChCCCiBmhBmhBCECtBGCtNICEGCDBB-ozB6G6GeOCESSCCCrF0B0BgBGD", !1)),
  Pf: () => new p(g("7F+6H+6HEddpuDCCFDDQEE", !1)),
  Pi: () => new p(g("rFt7Ht7HDBBDaapuDCCFDDQEE", !1)),
  Po: () => new p(g("hBCBCCBDECBLLBEEBcclCGGPBBI-V-VJzOzOBEBqB3B3BDDDtBBBVBBCBBOCCBBBrCDBnDsBsBBMBqHCB3BOBgBmImIBLLtE5D5D6DnMnMNwLwL7CLLBpFpFBNBCxDxDrCEBFBBwDFBsFlTlTBHBmY9D9DBBBoCBB+ECBCCBmBFBCDB6JBB5GBBhEGBCFBhFBBLGBdCB9DDB8BEB-BBBhCHBMjajaBJJBGBJIBDDBDCBEKBCCCBIB7kDDBCBBxDwEwEBFFBBBDDDBHBCBBCDDBLLBDBCJBDDBCCCBLBDCBtNCB6B+F+FjgdBBuICBkDLL0DFB9LDB3CBBpBCBCyByBBwBwBiDMBRBB9DDB-DBBRBB6HlxUlxUBFBDXXVBBDDBECBCDBICBHCCB2E2EBBBCCBDECBLLBEEBcclBDDB7M7MBBB9UxBxB-MoXoXoGgBgBxIIBnBxDxDBFBjCGB6CDB0ZlElEBDBtBDB+FGBuDBBCDB-DDBxBBBwCDBFOOCCB5CFBsDrJrJBCCBzDzDBDBLBBCpDpD7HWBqDCBdMBtCjEjEBBB9HpIpIBBB8E9C9CBGB0CCBCEB+CJB4GgDgDBDBrBBBmUBBrCMBwFxjBxjBBDB97CBB8zOBBmEiCiCBDBJpRpRBBBoJDBoK9lT9lTovHEB07C-a-aBAB", !1)),
  Ps: () => new p(g("oBzBzBgB-1D-1DC-6B-6B-rCEEnB4B4BQ7T7TCff-hBMCxChBhBCGC1MUChCCCiBmhBmhBCECaTTCECtNICEGCDipzBipzB4GeeCMCESSCCCrFzBzBgBEEDAB", !1)),
  S: () => new p(g("kBHHRCBgBCCcCCkBEBCBBDCCBCBDEEfgBgBrODBNNBGGBCCCBPB2DPPBxDxDsErIrIBBB3DCBDDDBvGvGLUUB4H4HIBBpEqLqLBHHB2H2H-DjEjEBGBlEwGwGqBmGmGiGCBQCCBBBDFBVECmEHBCFBCBBGDBmGBBxXJB0WuLuLlL+E+EBgBBiLJBKIBhiBCCBBBMCBOCBOCBOBBmCOOoBCBOCBUhBB-BBBCDBCBBLCCBBBGFBCECFMMBFFBDBGDBC7B7BBFFB2LBFcBD+HBXKByCtCBXnTBtBwBBDeBLyMBX+BBFfBD1LBDpEBmHFBmLBBvBZBC4CBN1GBbPBFOOBNNWBBHBB8CBB0HBBFJBhBlBBKRRBdBMdBJQQBeBLmBBQ-JBhuG-BBx0V2BB6RWBKBBoDBB+EDBLDB+RCBiHPPB+9T+9TpEgBBuLPBhCBB3BHBtBDBjDCCBBBD7E7EHRRBBBgBCCcCCiEGBCGBOBB6JIB6BQBDCBCMBEwBwBBrBB7zBBBwSmWmWBiKiKBGBnjC2kC2kCBbBr6SDBG3qU3qUk7DvHBLCBEzNBHWBQQBgDzDB9B1HBLmBBD7BBGCBXBBIdBF8BBWhCBE7F7FB1CBrbaagBaagBaagBaagBaa9B-PB4BDBzBHBCNBCBBp2BwNwNttCEE+DiOiOBvIvIBqBBFjDBNOBDOBCOBCkBBYgFB5BcBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBC7CBLAB", !1)),
  Sc: () => new p(g("kB+D+DBCBqnB8D8DzPBBzPBBI2H2HoImSmS8sClmClmCBgBB37hBkuVkuVtD7E7E8GBBEBB3-HDB-4wBxtCxtC", !1)),
  Sk: () => new p(g("+CCCoCHHFEEqQDBNNBGGBCCCBPB2DPPBjoBjoB15FCCBBBMCBOCBOCBOBB9kEBBkzdWBKBBoDBBxePPBniUniUBPB8bCCjF4g9B4g9BBDB", !1)),
  Sm: () => new p(g("rBRRBBB+BCCuBFFmBgBgB-XwQwQBBB8xGOOoBCBOCBsEoBoBBDBHlClCBDBGBBFGDIgBgBBDDCgBgBBqIBhBBB7CffBXBpBFB2OKK3BHBwDxKxKBDBDeBLPBhIiEBX+BBFfBDhIBxBUBDFB9+zB5Z5ZCCBlFRRBBB+BCCkEHHBCBitDBBhrwBx+Bx+BagBgBagBgBagBgBagBgBat5Ft5FB-uC-uCBHB", !1)),
  So: () => new p(g("mFDDFCCyerIrIBgEgEBvGvGLUUB4H4HkQ2L2LjEFBClElEwGqBqBoMCBQCCBBBDFBVECmEHBCFBCBBGDBmGBBxXJB0WzWzW+EhBBiLJBKIBksBBBCDBCBBLCCBHHBEBCECFMMBPPCBBC7B7BBKKBDBDDBCBBCBBCGBCeBDBBCCCBdBtIHBFTBDGBDwCBCdBanBBHnCBXKByCtCBX2FBCIBC1BBJuDBC3HBtBrBBhC-HBhQvBBWBBHmBBDpEBmHFBmLBBvBZBC4CBN1GBbPBFOOBNNWBBHBBxKBBFJBhBlBBKRRBdBMdBJQQBeBLmBBQ-JBhuG-BBx0V2BBibDBLBBC+R+RBBBqqUPBuLPBhCBB3BHBuBCBlPEEFBBOBB6JIB6BQBDCBCMBEwBwBBrBB7zBBBwSpgBpgBBGBnjC2kC2kCBGBFQBr6SDBG3qU3qUk7DvHBLCBEzNBHWBQPBhDzDB9B1HBLmBBD7BBGCBXBBIdBF8BBWhCBE7F7FB1CBqlB-PB4BDBzBHBCNBCBBp2B96C96CiEyWyWBqBBFjDBNOBDOBCOBCkBBYgFB5BcBOrBBFIBIBBPFB7E6HBG4WBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBB-B3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBC7CBLAB", !1)),
  Z: () => new p(g("gBgEgEgvFgsCgsCBJBeBBGwBwBh9DAB", !1)),
  Zl: () => new p(g("ohIA", !0)),
  Zp: () => new p(g("phIA", !0)),
  Zs: () => new p(g("gBgEgEgvFgsCgsCBJBlBwBwBh9DAB", !1)),
  ASCII_Hex_Digit: () => new p(g("wBJIFbF", !0)),
  Alphabetic: () => new p(g("hCZBHZBwBLLFGGBVBCeBCpOBFLBPEBICC3CeeBQBCBBDDBCHHCCBCCCBSBCyCBCqEBJlFBClBBDHHBnBBoBNBCCCBCCBCCJaBFDBeKBG3BBCGBPlDBCHBFHBFCBLCBDRRBuBBOkDBZgBBKBBFGGBWBDSBUYBIKBGXBCGBIJJBoBBLLBEGBHrCBCPBCCBFOBOSBCHBDBBDVBCGBCEEBCBEHBDBBDBBCJJFBBCEBNBBLFFBBBCFBFBBDVBCGBCBBCBBCBBFEBFBBDBBFIIBCBCSSBEBMCBCIBCCBCVBCGBCBBCEBEIBCCBCBBEQQBCBWDBFCBCHBDBBDVBCGBCBBCEBEHBDBBDBBKBBFBBCEBORRBCCBEBECBCDBEBBCCCBEEBEEBBBELBFEBECBCCBEHHpBMBCCBCWBCPBEHBCCBCCBJBBCCBCBBDDBdDBCHBCCBCWBCJBCEBEHBCCBCCBJBBGCBCDBOCBNMBCCBCoBBDHBCCBCCBCGGBCBIEBXFBCCBCRBEXBCIBCDDBFBJFBCCCBGBTBBO5BBGGBH0B0BBECBDBCXBCCCBRBCCBDEBCHHPDBhBgCgCBGBCjBBFSBFPBCjBBkC2BBCDDBDBR-BBLDBDlBBCGGDqBBCsKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPBR1CBDFBErTBDQBCZBGqCBEKBITBMUBNTBNMBCCBCBBNzBBDSBPFFkC4CBIqBBGlCBLeBCLBFIBYdBDEBMrBBFZB3BbBF+BBDTBzBYYBMMBBByBzBBCOBCHB0BpBBDDBLrBBCKBP2BBXCBLjBBDKBGqBBDCBqBDBCFBCBBEGGB+FBUhBBM1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGB1DOORMBmDFFDJBCEEBDBHGCBCBCKBDDBGEBFSSBnBBuZzBB34BkHBHDBEBBNlBBCGGD3BBIRRBVBKGBCGBCGBCGBCGBCGBCGBCGBCfBwB2O2OBBBaIBIEBDEBF1CBHCBC5CBCDBGqBBC9CBSfBxBPBhQ-tGBhCs0VBkCtBBDsIBEPBLBBVuBBGHBEwDBoBIBDmDBDxCBVUBCgBBZzBBNjCBCtBtBBEBECCBBBLgBBGiBBOcBEyBBCLBQRRBOBLEBC2BBKNBTWBEkCBCCCZCBDPBDDBMFBDFBDFBKGBCGBCqBBCNBH6DBWj9KBNWBFwBBloItLBDpDBnBGBNEBGLBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBlBZBHZBM4CBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmC0BBsIcBEwBBwBfBOdBGqBBGdBDjBBFHBCEBrB9EBTjBBFjBBFnBBJzBBNKBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCDBCBBGHBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4ByBBOyBBOnBBjBbBEGGBVB7HpBBCBBEBBRFBzBCBEcBLJJBUBrBRBvBUBcWBKlCBsBEBL4BBKOOBXBYyBBSDBJiBBEKKB+BBCDBKBBLCCkBRBChBBDHHBCB-BGBCCCBCBCOBCJBI4BBYDBCHBDBBDVBCGBCBBCEBEHBDBBDBBEHHGGBdJBCDDClBBCJBCDDCDBCBBECCtBhCBCCBCDBVCBfhCBDBBC5F5FB0BBDGBaFBjB+BBCEE8B1BBDoCoCBZBDNBWGB6F4BBoD-BBgBHBDDDBGBCBBCdBCBBDBBDDB+CHBDtBBDFBCCCBccBxBBDJBSnCBGTTBnCBoDHB5CgBBgBIBCsBBCGBCyByBBcBDVBCNBqCGBCBBCrBBECCBCCBBBCDDBZZBEBCBBCkBBCBBCDBCYYBqBBlIWBKQBCoBBECBwDwCwCB4cBnDuDBSjGBtyCgDBQvhBBSFBa68DBGmSB61GuBBy2B4RBIeBSuCBSdBTvBBRDBgBUBGSBxNsBB0G-BBhBYBDYBtBqCBF4BBIQBhCBBCNNBFBK1mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBFi7Fi7FBzCBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BeBHFB2GGBCQBDGBCBBCEBG9BBiBxDxDBrBBLGBRiKiKBcBTrBBlPbBlHdBDwGwGBdBCVBJBBhHGBCDBCBBCOBCkGB8BjCBEEE1lBDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1TZBHZBHZB3zD-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB", !1)),
  Dash: () => new p(g("tB9qB9qB0BiyDiyDmgBqgCqgCBEB+BoBoBQnMnMlgDDDgBBBFdd-NUUwDxszBxszBBmBmBLqFqFhzD-J-J", !1)),
  Emoji: () => new p(g("jBHHGJBwDFFu8HNN5GXX7CFBQBBwLBBNnFnFaKBFCBoGoHoHBLLK7B7BBCBCEBKGDBDDFDDCBBDIEBJJBBBGCCGLBMBBDCCBCCTDDBTTBEBCCCBEEBGGDBBFBBMBBGBBDGGBECBVVBGGBEBCDBDFFDDDBEBCDDCCCHEEHLLBQQDFFCFFBBBCMMBxBxBBBBKeP1LBBwOCBUBB0BFF7mBNN6SCCrrvDrGrGhFBBNBBPDDBIBsCZBCBBYVVDIBWBBvFhBBDvDBDBBCCBDyCBDCBCmIBC+BBMFBCXBIBBDHBNDDBCBDFFBOOBDDJBBKGGBBBNCBJCBDCCFHHEHHB0CBxBlCBGHBDDBEJBECCBEEDJBkHLBF8I8IBtBBCJBC4FBxDMBEKBE4BBCFFBOBDLBFJB", !1)),
  Emoji_Component: () => new p(g("jBHHGJB0+H2G2Gsp3B3+8B3+8BBYB8PEBxtBDBtzhY-CB", !1)),
  Emoji_Modifier: () => new p(g("7-8DE", !0)),
  Emoji_Modifier_Base: () => new p(g("9wJ8G8GRDB4jzD9B9BBBBDDDBBB2DBBDKBWSBEFFBBBCCBICCZqGqGBFFWFFBvFvFBBBEEB0CRRBBBKMMgSDDJHBHKKBIBDCB5B+B+BBCCBCCSCBCMBmHCBrBIB", !1)),
  Emoji_Presentation: () => new p(g("64IBBuGDBEDDqQBBWBBzBLBsBUUOJJBSSBGGBJJGWWIBBCFFDIIFBBdkBkBCFFBBBC+B+BBBBZPP8aBB0BFFvlxDrGrG-FDDBIBsCZBCZZVDDBDBCCBWBBvFgBBNIBClCBCVBNqBBFEBNQBEEEBlCBCCCB5FBD+BBODBCXBTbbBOO3C0CBxBlCBHEEBBBDDBEDBMBBIIBkHLBF8I8IBtBBCJBC4FBxDMBEKBE4BBCFFBOBDLBFJB", !1)),
  Extended_Pictographic: () => new p(g("pFFFu8HNN5GXX7CFBQBBwLBBNnFnFaKBFCBoGoHoHBLLK7B7BBCBCEBKGDBDDFDDCBBDIEBJJBBBGCCGLBMBBDCCBCCTDDBTTBEBCCCBEEBGGDBBFBBMBBGBBDGGBECBVVBGGBEBCDBDFFDDDBEBCDDCCCHEEHLLBQQDFFCFFBBBCMMBxBxBBBBKeP1LBBwOCBUBB0BFF7mBNN6SCCrrvDoBoBBCBlDLBQBBQPPBmBmBBIBxDBBNBBPDDBIBU3BBcOBLVVDIBCDBKWBH7FBDvDBDBBCCBDyCBDCBCDBG9HBC+BBMFBCXBIBBDHBNDDBCBDFFBOOBDDJBBKGGBBBNCBJCBDCCFHHEHHB0CBxBlCBGHBDQBECCBEBDMB7GlBBNDB5BHBLFBpBHBfBBNDBDNBKmBBNuBBCJBC4FB5CHBPxEBhI9fB", !1)),
  Hex_Digit: () => new p(g("wBJIFbFq1-BJIFbF", !0)),
  Lowercase: () => new p(g("hDZBwBLLFlBlBBWBCHBC2BCBQCBuBCDECBBBDCCDEEBFFDEEBBBDDDCCCDCCBCCDEECDDBDDBBBHGDCOCBSCBDDCEEC4BCBFBDDDBCCFICBjCBDiBBIBBfEBhDsBsBCEEDDBTccBhBBCBBECBCWCBDBCGDB0B0BBuBBCgBCK0BCDMCBgDCxBoBBo6CqBBCDB5XFBjkCIBC2D2DB+FBiC0ECBHBCgDCBHBJFBLHBJHBJFBLHBJHBJNBDHBJHBJHBJEBCBBHEEBBBCBBJDBDBBJHBLCBCBB6DOORMBuDEEBEEcKFDBBJDBFiBiBBOBFsasaBYBn6BvBBCEEBGCFCCBCCBGBEiDCBIICFFNlBBCGG0oesBCUaCBBBmEMCBBBC8BCBIBCCCDICFCCDCCBBBCSCGGGCMCFCCDOCWDBCCCBBB2ZqBBCNBHvCBh6TGBNEBqhBZBumBnBBpEjBB8EKBCOBCGBCBBkODDBBBCpBBCIBmoByBB+DVB75CfBhsVfB8BYBnqZZBbGBCRBbZBbDBCCCBFBCKBbZBbZBbZBbZBbZBbZBbZBbZBbbBdYBCFBbYBCFBbYBCFBbYBCFBbYBCFBC15B15BBIBCTBHFBmI9BB1lChBB", !1)),
  Math: () => new p(g("rBRRBBBgBeeCuBuBFmBmBgB5W5WBBBDbbBDDBBBwQCBuwGccBBBMEEOPPBCBWEBMEBiCMBFEEBFFBDBTFFDJBCDDBEBHEEBDDBCCBBBCFBENBClClCBWBCFBCBBFBBFfBCHHBPPBqIBJDBVBB7CffBZBCZZMGB+NBBNJBFFBFBBDBBEEBPCCDFBMHBGBB6BCCeDBKCBxK-BBhI-PBxBUBDFB9+zB4Z4ZBEBCjFjFRCBeCCeCCkEHHBCBitDBBhrwBwoBwoBBzCBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBDxBBhwFDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBB-uCIB", !1)),
  Quotation_Mark: () => new p(g("iBFFkEQQ96HHBaBBowDqOqOBCBOCBixzBDB+FFF7CBB", !1)),
  Terminal_Punctuation: () => new p(g("hBLLCMMBEE-ZJJiQ6B6BpCPPCCB1FsBsBBJBCsHsHB3B3BBEBCHBgBmImIB1nB1nBBtFtFFFB4JBB2YHBmY9D9DBBBoCBB+ECBEoBoBBCBDBB7JBBjLDBjFBBLBBCCBeCB8FEB-BBBldYYBKKBBBwlDCBzJOOFLLCBBEBBtNBB8ndBBuICBkHEB-LBB3CBBgD4E4EBBB0ECBgERRB6H6HnxUDDB6B6BBBBCDBqFLLCMMBEEiCDD7hBxBxBnkBoGoG3JBB5EFBlCFB6CDB5dEBtBDB+FGBxDDBgECBiEBBHRRB5C5CBDBtDrJrJB2D2DBBBNBBnLDBEOBqDBB6HCBmQCC8HBB4CBBFBB-MCBuBmUmUBrCrCBspBspBBDB6vRBBmEiCiCBBBLqRqRBoJoJBnwTnwTovHDB", !1)),
  Uppercase: () => new p(g("hCZBmDWBCGBiB2BCDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIJDCMCDQCDDDCCBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBDDBBBEWCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBpCDBNDBNDBNEBMDBnIFFECBDCBDEEBDBHGCBCBDDBLBBGbbBOBUzZzZBYBx5BvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoqZZBbZBbZBbCCBGDBDDBCBCHBbZBbBBCDBDHBCGBcBBCDBCEBCEEBFBcZBbZBbZBbZBbZBbZBfYBiBYBiBYBiBYBiBYBiB2pE2pEBgBBvgCZBHZBHZB", !1)),
  White_Space: () => new p(g("JEBTlDlDbgvFgvFgsCKBeBBGwBwBh9DAB", !1))
})), M(on, "SCRIPTS", new Si({
  Adlam: () => new p(g("go6DrCFJFB", !0)),
  Ahom: () => new p(g("g4lCaDOFW", !0)),
  Anatolian_Hieroglyphs: () => new p(g("ggxCmS", !0)),
  Arabic: () => new p(g("gwBEBCFBCNBCCBCfBCJBMZBCrDBChBBxCvBBxHhBBGqCBCcBxy8BtPBDvEBhBPBxDEBCmEBk7DeBkCFBJIBiBFBh43BDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBB", !1)),
  Armenian: () => new p(g("xpBlBDxBDCks9BE", !0)),
  Avestan: () => new p(g("g4iC1BEG", !0)),
  Balinese: () => new p(g("g4GsCCxB", !0)),
  Bamum: () => new p(g("g1pB3CpowB4R", !0)),
  Bassa_Vah: () => new p(g("w26CdDF", !0)),
  Batak: () => new p(g("g+GzBJD", !0)),
  Bengali: () => new p(g("gsCDBCHBDBBDVBCGBCEEBCBDIBDBBDDBJFFBCCBDBDYB", !1)),
  Beria_Erfe: () => new p(g("g17CYDY", !0)),
  Bhaiksuki: () => new p(g("ggnCICsBCNLc", !0)),
  Bopomofo: () => new p(g("qXB6wLqBxDf", !0)),
  Brahmi: () => new p(g("ggkCtCFjBKA", !0)),
  Braille: () => new p(g("ggK-H", !0)),
  Buginese: () => new p(g("gwGbDB", !0)),
  Buhid: () => new p(g("g6FT", !0)),
  Canadian_Aboriginal: () => new p(g("ggF-TxRlC7tgCP", !0)),
  Carian: () => new p(g("g1gCwB", !0)),
  Caucasian_Albanian: () => new p(g("wphCzBMA", !0)),
  Chakma: () => new p(g("gokC0BCR", !0)),
  Cham: () => new p(g("gwqB2BKNDJDD", !0)),
  Cherokee: () => new p(g("g9E1CDFz7lBvC", !0)),
  Chorasmian: () => new p(g("w9jCb", !0)),
  Common: () => new p(g("AgCBbFBbuBBCOBCEBYgBgBiOmBBGEBDTB1DKKHCC+THHPEEhB9E9ElQiEiEB6mB6mB2MDBjJwvBwvBBBBoCBBsGBBCumBumBOIIBCBCFBCCBDmYmYBKBD2CBCKBEKBCOBShBB-BlBBCCBDFBCaBCQBqBCBF5UBXKBW-cBhIzTBDpEBhQ9CBzMUBCCCBXBQHBFDB8CBBE7C7CB0E0EBOBhBlBBKxBxBB+BBgBwCBwB5C5CBmFBhuG-BBhoWhBBnDCBmFJB1HhFhFsMPPBzuUzuUBxGxGBIBXiBBCSBCDB0ECCBeBbFBbKBLuBuBBhChCBFBCGBLEBjICBFsBBEIBxCMB0BsBBlHaBltuBDB96D8HBEzNBHWBQQBgDzDB9B1HBLmBBD9BBEQBJBBIdBF8BB2GTBNTBN2CBKYBoE0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBDxBByjFjCBtC8BBjWrBBFjDBNOBDOBCOBCkBBLtFB5BZBCBBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBCmDBnghYffB+CB", !1)),
  Coptic: () => new p(g("ifNxkKzDGG", !0)),
  Cuneiform: () => new p(g("ggoC5cnDuDCEMjG", !0)),
  Cypriot: () => new p(g("ggiCFBDCCBqBBCBBEDD", !1)),
  Cypro_Minoan: () => new p(g("w8rCiD", !0)),
  Cyrillic: () => new p(g("ggBkEBDoFBx6FKBhFtCtCojEfBhie-CBv8VBBhw4B9BBiBAB", !1)),
  Deseret: () => new p(g("gghCvC", !0)),
  Devanagari: () => new p(g("goCwCFODZh7nBfhwcJ", !0)),
  Dives_Akuru: () => new p(g("gomCGBDDDBGBCBBCdBCBBDLBKJB", !1)),
  Dogra: () => new p(g("ggmC7B", !0)),
  Duployan: () => new p(g("ggvDqDGMEIIJDD", !0)),
  Egyptian_Hieroglyphs: () => new p(g("ggsC1iBL68D", !0)),
  Elbasan: () => new p(g("gohCnB", !0)),
  Elymaic: () => new p(g("g-jCW", !0)),
  Ethiopic: () => new p(g("gwEoCBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBDfBEZBnvGWBKGBCGBCGBCGBCGBCGBCGBCGBjpfFBDFBDFBKGBCGBylvCGBCDBCBBCOB", !1)),
  Garay: () => new p(g("gqjClBEcJB", !0)),
  Georgian: () => new p(g("glElBBCGGDqBBCDBx8CqBBDCBhiElBBCGG", !1)),
  Glagolitic: () => new p(g("ggL-Ch9sDGCQDGCBCE", !0)),
  Gothic: () => new p(g("w5gCa", !0)),
  Grantha: () => new p(g("g4kCDBCHBDBBDVBCGBCBBCEBDIBDBBDCBDHHGGBDGBEEB", !1)),
  Greek: () => new p(g("wbDBCCBDDBCFFCCCBBBCCCBSBC+BBPPBnpGEBzBEBFEB1ChKhKBUBDFBDlBBDFBDHBCGCBdBD0BBCOBCNBDFBCSBDCBCIBoJ-xiB-xiB7uVuCBSgj0Bgj0BBkCB", !1)),
  Gujarati: () => new p(g("h0CCBCIBCCBCVBCGBCBBCEBDJBCCBCCBDQQBCBDLBIGB", !1)),
  Gunjala_Gondi: () => new p(g("grnCFCBCkBCBCFIJ", !0)),
  Gurmukhi: () => new p(g("hwCCBCFBFBBDVBCGBCBBCBBCBBDCCBDBFBBDCBEIIBCBCIIBPB", !1)),
  Gurung_Khema: () => new p(g("go4C5B", !0)),
  Han: () => new p(g("g0LZBC4CBN1GBwBCCaIBPDBle-tGBhC-vUBhoWtLBDpDBpodBBNGBqgkB-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB", !1)),
  Hangul: () => new p(g("goE-HvxHBiI9CyDeiCei3dckUj9KNWFwBl9JeEFDFDFDC", !0)),
  Hanifi_Rohingya: () => new p(g("gojCnBJJ", !0)),
  Hanunoo: () => new p(g("g5FU", !0)),
  Hatran: () => new p(g("gniCSCBGE", !0)),
  Hebrew: () => new p(g("xsB2BBJaBFFBpp9BZBCEBCCCBCCBCCBIB", !1)),
  Hiragana: () => new p(g("hiM1CBHCBi7-C+IBTeeBBBulQAB", !1)),
  Imperial_Aramaic: () => new p(g("giiCVCI", !0)),
  Inherited: () => new p(g("gYvDB2IBBlOKBbhXhXBCB8qEtBBDLBlPCBCMBCGBFHHEBBnG-BBtQBBjGgBB65DDBsDBBmrzBPBRNBwejHjH7iEl+uBl+uBBsBBDWBhRCBSHBDGBfDBz6rYvHB", !1)),
  Inscriptional_Pahlavi: () => new p(g("g7iCSGH", !0)),
  Inscriptional_Parthian: () => new p(g("g6iCVDH", !0)),
  Javanese: () => new p(g("gsqBtCDJFB", !0)),
  Kaithi: () => new p(g("gkkCiCLA", !0)),
  Kannada: () => new p(g("gkDMCCCWCJCEDICCCDIBGCCDDJCC", !0)),
  Katakana: () => new p(g("hlM5CBDCBxHPBxGuBBC3CBvgzBJBCsBBzisBDBCGBCBBCgJgJBBBzBPPBCB", !1)),
  Kawi: () => new p(g("g4nCQCoBEc", !0)),
  Kayah_Li: () => new p(g("goqBtBCA", !0)),
  Kharoshthi: () => new p(g("gwiCDCBGHCCCcDCFJII", !0)),
  Khitan_Small_Script: () => new p(g("k-7C84G84GB0OBqBAB", !1)),
  Khmer: () => new p(g("g8F9CDJHJnPf", !0)),
  Khojki: () => new p(g("gwkCRCuB", !0)),
  Khudawadi: () => new p(g("w1kC6BGJ", !0)),
  Kirat_Rai: () => new p(g("gq7C5B", !0)),
  Lao: () => new p(g("h0DBBCCCBDBCXBCCCBVBDEBCCCBFBCJBDDB", !1)),
  Latin: () => new p(g("hCZBHZBwBQQGWBCeBCgOBoBEB8wGlBBHwBBGDBGMBClCBiC-HByLOORMBuEBBHccSoBB42CfBj1elDBExCBVOBxZqBBCIBCDB38TGB7gBZBHZBmhCFBCpBBCIBm61BeBHFB", !1)),
  Lepcha: () => new p(g("ggH3BEOEC", !0)),
  Limbu: () => new p(g("goGeBCLBFLBFEEBKB", !1)),
  Linear_A: () => new p(g("gwhC2JKVLH", !0)),
  Linear_B: () => new p(g("gggCLCZCSCBCODNjB6D", !0)),
  Lisu: () => new p(g("wmpBvBx1eA", !0)),
  Lycian: () => new p(g("g0gCc", !0)),
  Lydian: () => new p(g("gpiCZGA", !0)),
  Mahajani: () => new p(g("wqkCmB", !0)),
  Makasar: () => new p(g("g3nCY", !0)),
  Malayalam: () => new p(g("goDMCCCyBCCCFFPDZ", !0)),
  Mandaic: () => new p(g("giCbDA", !0)),
  Manichaean: () => new p(g("g2iCmBFL", !0)),
  Marchen: () => new p(g("wjnCfDVCN", !0)),
  Masaram_Gondi: () => new p(g("gonCGBCBBCrBBECCBCCBHBJJB", !1)),
  Medefaidrin: () => new p(g("gy7C6C", !0)),
  Meetei_Mayek: () => new p(g("g3qBWqGtBDJ", !0)),
  Mende_Kikakui: () => new p(g("gg6DkGDP", !0)),
  Meroitic_Cursive: () => new p(g("gtiCXFTDtB", !0)),
  Meroitic_Hieroglyphs: () => new p(g("gsiCf", !0)),
  Miao: () => new p(g("g47CqCF4BIQ", !0)),
  Modi: () => new p(g("gwlCkCMJ", !0)),
  Mongolian: () => new p(g("ggGBBDCCBSBH4CBIqBB2t-BMB", !1)),
  Mro: () => new p(g("gy6CeCJFB", !0)),
  Multani: () => new p(g("g0kCGBCCCBCBCOBCKB", !1)),
  Myanmar: () => new p(g("ggE-EhqmBeiDfxibT", !0)),
  Nabataean: () => new p(g("gkiCeJI", !0)),
  Nag_Mundari: () => new p(g("wm5DpB", !0)),
  Nandinagari: () => new p(g("gtmCHDtBDK", !0)),
  New_Tai_Lue: () => new p(g("gsGrBFZHKEB", !0)),
  Newa: () => new p(g("gglC7CCE", !0)),
  Nko: () => new p(g("g+B6BDC", !0)),
  Nushu: () => new p(g("h-7CvsQvsQBqMB", !1)),
  Nyiakeng_Puachue_Hmong: () => new p(g("go4DsBENDJFB", !0)),
  Ogham: () => new p(g("g0Fc", !0)),
  Ol_Chiki: () => new p(g("wiHvB", !0)),
  Ol_Onal: () => new p(g("wu5DqBFA", !0)),
  Old_Hungarian: () => new p(g("gkjCyBOyBIF", !0)),
  Old_Italic: () => new p(g("g4gCjBKC", !0)),
  Old_North_Arabian: () => new p(g("g0iCf", !0)),
  Old_Permic: () => new p(g("w6gCqB", !0)),
  Old_Persian: () => new p(g("g9gCjBFN", !0)),
  Old_Sogdian: () => new p(g("g4jCnB", !0)),
  Old_South_Arabian: () => new p(g("gziCf", !0)),
  Old_Turkic: () => new p(g("ggjCoC", !0)),
  Old_Uyghur: () => new p(g("w7jCZ", !0)),
  Oriya: () => new p(g("h4CCCHDBDVCGCBCEDIDBDCICFBCEDR", !0)),
  Osage: () => new p(g("wlhCjBFjB", !0)),
  Osmanya: () => new p(g("gkhCdDJ", !0)),
  Pahawh_Hmong: () => new p(g("g46ClCLJCGCUGS", !0)),
  Palmyrene: () => new p(g("gjiCf", !0)),
  Pau_Cin_Hau: () => new p(g("g2mC4B", !0)),
  Phags_Pa: () => new p(g("giqB3B", !0)),
  Phoenician: () => new p(g("goiCbEA", !0)),
  Psalter_Pahlavi: () => new p(g("g8iCRIDNG", !0)),
  Rejang: () => new p(g("wpqBjBMA", !0)),
  Runic: () => new p(g("g1FqCEK", !0)),
  Samaritan: () => new p(g("ggCtBDO", !0)),
  Saurashtra: () => new p(g("gkqBlCJL", !0)),
  Sharada: () => new p(g("gskC-ChsCH", !0)),
  Shavian: () => new p(g("wihCvB", !0)),
  Siddham: () => new p(g("gslC1BDlB", !0)),
  Sidetic: () => new p(g("gqiCZ", !0)),
  SignWriting: () => new p(g("gg2DrUQECO", !0)),
  Sinhala: () => new p(g("hsDCBCRBEXBCIBCDDBFBEFFBEBCCCBGBHJBDCBt-gCTB", !1)),
  Sogdian: () => new p(g("w5jCpB", !0)),
  Sora_Sompeng: () => new p(g("wmkCYIJ", !0)),
  Soyombo: () => new p(g("wymCyC", !0)),
  Sundanese: () => new p(g("g8G-BhIH", !0)),
  Sunuwar: () => new p(g("g+mChBPJ", !0)),
  Syloti_Nagri: () => new p(g("ggqBsB", !0)),
  Syriac: () => new p(g("g4BNC7BDCxIK", !0)),
  Tagalog: () => new p(g("g4FVKA", !0)),
  Tagbanwa: () => new p(g("g7FMCCCB", !0)),
  Tai_Le: () => new p(g("wqGdDE", !0)),
  Tai_Tham: () => new p(g("gxG+BCcDKHJHN", !0)),
  Tai_Viet: () => new p(g("g0qBiCZE", !0)),
  Tai_Yo: () => new p(g("g25DeCVJB", !0)),
  Takri: () => new p(g("g0lC5BHJ", !0)),
  Tamil: () => new p(g("i8CBBCFBECBCDBEBBCCCBEEBEEBBBELBFEBECBCDBDHHPUBm+kCxBBOAB", !1)),
  Tangsa: () => new p(g("wz6CuCCJ", !0)),
  Tangut: () => new p(g("g-7CgBgBB+3GBhQeBiDyDB", !1)),
  Telugu: () => new p(g("ggDMCCCWCPDICCCDIBCCCBDDDJII", !0)),
  Thaana: () => new p(g("g8BxB", !0)),
  Thai: () => new p(g("hwD5BGb", !0)),
  Tibetan: () => new p(g("g4DnCCjBFmBCjBCOCGFB", !0)),
  Tifinagh: () => new p(g("wpL3BIBPA", !0)),
  Tirhuta: () => new p(g("gklCnCJJ", !0)),
  Todhri: () => new p(g("guhCzB", !0)),
  Tolong_Siki: () => new p(g("wtnCrBFJ", !0)),
  Toto: () => new p(g("w04De", !0)),
  Tulu_Tigalari: () => new p(g("g8kCJBCDDClBBCJBCDDCDBCJBCBBJBB", !1)),
  Ugaritic: () => new p(g("g8gCdCA", !0)),
  Unknown: () => new p(g("4bBBHDBICCVuMuMnBBBzBBBE4B4BBGBcDBHKBvI9B9BBmDmDBMB8BBByBBBQddBCCMEBjBEBuHJJBDDBXXICCBBBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBbFB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKmDmDNBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBjoIBvLBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCC-FCBHBBHBBHBBECBIIIBIBGBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIBlCJBCBBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMB3iBJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBJ76DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBjGUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIm8yVBCdBhD-DBxHvw-FB", !1)),
  Vai: () => new p(g("gopBrJ", !0)),
  Vithkuqi: () => new p(g("wrhCKCOCGCBCKCOCGCB", !0)),
  Wancho: () => new p(g("g24D5BGA", !0)),
  Warang_Citi: () => new p(g("glmCyCNA", !0)),
  Yezidi: () => new p(g("g0jCpBCCDB", !0)),
  Yi: () => new p(g("ggoBskBE2B", !0)),
  Zanabazar_Square: () => new p(g("gwmCnC", !0))
})), M(on, "FOLD_CATEGORIES", new Si({
  L: () => new p(g("laA", !0)),
  LC: () => new p(g("laA", !0)),
  Ll: () => new p(g("hCZBmDWBCGBiBuBCEECDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIBBCBBCBBCOCDQCDBBCCCBBBC4BCIBBCBBDCCBCBCGC3HrBrBCEEJHHCCBCCCBCCBPBCIBkBJJCUCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBZHBJHBJHBJEBMEBMDBNEBMEBqJEEBHHxC9zC9zCBuBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoyehBB", !1)),
  Lt: () => new p(g("kOCCBCCBCClBCCtsHHBJHBJHBMQQwBAB", !1)),
  Lu: () => new p(g("hDZB7BqBqBBWBCHBCuBCEECDOCDsBCDECBBBDCCDEEGDDECBDDDCCCDFFDEECDDECCGBBCBBCBBCOCBSCDBBCEECkBCEQCJDDBCCFICBEBCBBCCCBEEBCCBCBCEBDCCBDDIDDCBBEFBGLLBnFnFsBCCEEEBBBvBDBCdBCBBECBCWCBDBCGD1BvBBCgBCK0BCDMCBgDCyBlBBq6CqBBDCB5XFBjkCIBCvHvHERRzD0ECGGGC8CCBHBJFBLHBJHBJFBMGCJHBJNBzBBBNSSBPPBEEpL2B2Bs1CvBBCEEBGCHDDLiDCJCCFNNBkBBCGG0oesBCUaCoEMCE8BCLCCDICFFFCBBDSCMOCFCCDOCb9a9advCBi8UZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBvyehBB", !1)),
  M: () => new p(g("5cgBgBlgHAB", !1)),
  Mn: () => new p(g("5cgBgBlgHAB", !1)),
  Emoji: () => new p(g("8mJA", !0)),
  Extended_Pictographic: () => new p(g("8mJA", !0)),
  Lowercase: () => new p(g("hCZBmDWBCGBiBuBCEECDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIBBCBBCBBCOCDQCDBBCCCBBBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBJJCUCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBZHBJHBJHBJEBMEBMDBNEBMEBqJEEBHHuBPBUzZzZBYBx5BvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoyehBB", !1)),
  Math: () => new p(g("ycGDCHHFMMDDDCHHFAB", !1)),
  Uppercase: () => new p(g("hDZB7BqBqBBWBCHBCuBCEECDOCDsBCDECBBBDCCDEEGDDECBDDDCCCDFFDEECDDECCGBBCBBCBBCOCBSCDBBCEECkBCEQCJDDBCCFICBEBCBBCCCBEEBCCBCBCEBDCCBDDIDDCBBEFBGLLBnFnFsBCCEEEBBBvBDBCdBCBBECBCWCBDBCGD1BvBBCgBCK0BCDMCBgDCyBlBBq6CqBBDCB5XFBjkCIBCvHvHERRzD0ECGGGC8CCBHBJFBLHBJHBJFBMGCJHBJNBzBBBNSSBPPBEEpLiBiBBOBFsasaBYBn6BvBBCEEBGCHDDLiDCJCCFNNBkBBCGG0oesBCUaCoEMCE8BCLCCDICFFFCBBDSCMOCFCCDOCb9a9advCBi8UZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBvyehBB", !1))
})), M(on, "FOLD_SCRIPT", new Si({
  Common: () => new p(g("8cgBgB", !1)),
  Greek: () => new p(g("1FwUwU", !1)),
  Inherited: () => new p(g("5cgBgBlgHAB", !1))
})), on), de, K = (de = class {
  static is32(e, t) {
    let n = 0, s = e.length;
    for (; n < s; ) {
      const i = n + Math.floor((s - n) / 2), o = e.getLo(i), B = e.getHi(i);
      if (o <= t && t <= B) {
        const u = e.getStride(i);
        return (t - o) % u === 0;
      }
      t < o ? s = i : n = i + 1;
    }
    return !1;
  }
  static is(e, t) {
    if (t <= de.MAX_LATIN1) {
      for (let n = 0; n < e.length; n++) {
        if (t > e.getHi(n)) continue;
        const s = e.getLo(n);
        if (t < s) return !1;
        const i = e.getStride(n);
        return (t - s) % i === 0;
      }
      return !1;
    }
    return e.length > 0 && t >= e.getLo(0) && de.is32(e, t);
  }
  static isUpper(e) {
    if (e <= de.MAX_LATIN1) {
      const t = String.fromCodePoint(e);
      return t.toUpperCase() === t && t.toLowerCase() !== t;
    }
    return de.is(nt.Upper, e);
  }
  static isPrint(e) {
    return e <= de.MAX_LATIN1 ? e >= 32 && e < de.MAX_ASCII || e >= 161 && e !== 173 : de.is(nt.Print, e);
  }
  static simpleFold(e) {
    if (nt.CASE_ORBIT.has(e)) return nt.CASE_ORBIT.get(e);
    const t = b.toLowerCase(e);
    return t !== e ? t : b.toUpperCase(e);
  }
  static equalsIgnoreCase(e, t) {
    if (e === t) return !0;
    if (e < 0 || t < 0) return !1;
    if (e <= de.MAX_ASCII && t <= de.MAX_ASCII)
      return 65 <= e && e <= 90 && (e |= 32), 65 <= t && t <= 90 && (t |= 32), e === t;
    for (let n = de.simpleFold(e); n !== e; n = de.simpleFold(n)) if (n === t) return !0;
    return !1;
  }
}, M(de, "MAX_RUNE", 1114111), M(de, "MAX_ASCII", 127), M(de, "MAX_LATIN1", 255), M(de, "MAX_BMP", 65535), M(de, "MIN_FOLD", 65), M(de, "MAX_FOLD", 125251), M(de, "MIN_HIGH_SURROGATE", 55296), M(de, "MAX_HIGH_SURROGATE", 56319), M(de, "MIN_LOW_SURROGATE", 56320), M(de, "MAX_LOW_SURROGATE", 57343), M(de, "MIN_SUPPLEMENTARY_CODE_POINT", 65536), de);
const pB = 256, dC = new Uint8Array(pB);
for (let r = 0; r < pB; r++) dC[r] = 97 <= r && r <= 122 || 65 <= r && r <= 90 || 48 <= r && r <= 57 || r === 95 ? 1 : 0;
let Da = null, Ia = null;
var Ee, W = (Ee = class {
  static emptyInts() {
    return [];
  }
  static isByteArray(e) {
    return Array.isArray(e) || e instanceof Uint8Array;
  }
  static isalnum(e) {
    return b.CODES.get("0") <= e && e <= b.CODES.get("9") || b.CODES.get("a") <= e && e <= b.CODES.get("z") || b.CODES.get("A") <= e && e <= b.CODES.get("Z");
  }
  static unhex(e) {
    return b.CODES.get("0") <= e && e <= b.CODES.get("9") ? e - b.CODES.get("0") : b.CODES.get("a") <= e && e <= b.CODES.get("f") ? e - b.CODES.get("a") + 10 : b.CODES.get("A") <= e && e <= b.CODES.get("F") ? e - b.CODES.get("A") + 10 : -1;
  }
  static escapeRune(e) {
    let t = "";
    if (K.isPrint(e))
      Ee.METACHARACTERS.indexOf(String.fromCodePoint(e)) >= 0 && (t += "\\"), t += String.fromCodePoint(e);
    else switch (e) {
      case b.CODES.get('"'):
        t += '\\"';
        break;
      case b.CODES.get("\\"):
        t += "\\\\";
        break;
      case b.CODES.get("	"):
        t += "\\t";
        break;
      case b.CODES.get(`
`):
        t += "\\n";
        break;
      case b.CODES.get("\r"):
        t += "\\r";
        break;
      case b.CODES.get("\b"):
        t += "\\b";
        break;
      case b.CODES.get("\f"):
        t += "\\f";
        break;
      default: {
        let n = e.toString(16);
        e < 256 ? (t += "\\x", n.length === 1 && (t += "0"), t += n) : t += `\\x{${n}}`;
        break;
      }
    }
    return t;
  }
  static stringToRunes(e) {
    const t = String(e), n = [];
    let s = 0;
    for (; s < t.length; ) {
      const i = t.codePointAt(s);
      n.push(i), s += i > K.MAX_BMP ? 2 : 1;
    }
    return n;
  }
  static runeToString(e) {
    return String.fromCodePoint(e);
  }
  static isWordRune(e) {
    return e < pB ? dC[e] === 1 : !1;
  }
  static emptyOpContext(e, t) {
    let n = 0;
    return e < 0 && (n |= Ee.EMPTY_BEGIN_TEXT | Ee.EMPTY_BEGIN_LINE), e === 10 && (n |= Ee.EMPTY_BEGIN_LINE), t < 0 && (n |= Ee.EMPTY_END_TEXT | Ee.EMPTY_END_LINE), t === 10 && (n |= Ee.EMPTY_END_LINE), Ee.isWordRune(e) !== Ee.isWordRune(t) ? n |= Ee.EMPTY_WORD_BOUNDARY : n |= Ee.EMPTY_NO_WORD_BOUNDARY, n;
  }
  /**
  * Returns a string that quotes all regular expression metacharacters inside the argument text;
  * the returned string is a regular expression matching the literal text. For example,
  * {@code quoteMeta("[foo]").equals("\\[foo\\]")}.
  * @param {string} str
  * @returns {string}
  */
  static quoteMeta(e) {
    return e.split("").map((t) => Ee.METACHARACTERS.indexOf(t) >= 0 ? `\\${t}` : t).join("");
  }
  static charCount(e) {
    return e > K.MAX_BMP ? 2 : 1;
  }
  /**
  * High-speed conversion from TypedArrays to standard JS Arrays.
  * Bypasses the expensive Symbol.iterator overhead of Array.from()
  */
  static toArray(e) {
    const t = e.length, n = new Array(t);
    for (let s = 0; s < t; s++) n[s] = e[s];
    return n;
  }
  static stringToUtf8ByteArray(e) {
    if (globalThis.TextEncoder)
      return Da || (Da = new TextEncoder()), Da.encode(e);
    {
      let t = [], n = 0;
      for (let s = 0; s < e.length; s++) {
        let i = e.charCodeAt(s);
        i < 128 ? t[n++] = i : i < 2048 ? (t[n++] = i >> 6 | 192, t[n++] = i & 63 | 128) : (i & 64512) === K.MIN_HIGH_SURROGATE && s + 1 < e.length && (e.charCodeAt(s + 1) & 64512) === K.MIN_LOW_SURROGATE ? (i = K.MIN_SUPPLEMENTARY_CODE_POINT + ((i & 1023) << 10) + (e.charCodeAt(++s) & 1023), t[n++] = i >> 18 | 240, t[n++] = i >> 12 & 63 | 128, t[n++] = i >> 6 & 63 | 128, t[n++] = i & 63 | 128) : (t[n++] = i >> 12 | 224, t[n++] = i >> 6 & 63 | 128, t[n++] = i & 63 | 128);
      }
      return t;
    }
  }
  static utf8ByteArrayToString(e) {
    if (globalThis.TextDecoder) {
      Ia || (Ia = new TextDecoder("utf-8"));
      const t = e instanceof Uint8Array ? e : new Uint8Array(e);
      return Ia.decode(t);
    } else {
      let t = [], n = 0, s = 0;
      for (; n < e.length; ) {
        let i = e[n++];
        if (i < 128) t[s++] = String.fromCharCode(i);
        else if (i > 191 && i < 224) {
          let o = e[n++];
          t[s++] = String.fromCharCode((i & 31) << 6 | o & 63);
        } else if (i > 239 && i < 365) {
          let o = e[n++], B = e[n++], u = e[n++], c = ((i & 7) << 18 | (o & 63) << 12 | (B & 63) << 6 | u & 63) - K.MIN_SUPPLEMENTARY_CODE_POINT;
          t[s++] = String.fromCharCode(K.MIN_HIGH_SURROGATE + (c >> 10)), t[s++] = String.fromCharCode(K.MIN_LOW_SURROGATE + (c & 1023));
        } else {
          let o = e[n++], B = e[n++];
          t[s++] = String.fromCharCode((i & 15) << 12 | (o & 63) << 6 | B & 63);
        }
      }
      return t.join("");
    }
  }
}, M(Ee, "METACHARACTERS", "\\.+*?()|[]{}^$"), M(Ee, "EMPTY_BEGIN_LINE", 1), M(Ee, "EMPTY_END_LINE", 2), M(Ee, "EMPTY_BEGIN_TEXT", 4), M(Ee, "EMPTY_END_TEXT", 8), M(Ee, "EMPTY_WORD_BOUNDARY", 16), M(Ee, "EMPTY_NO_WORD_BOUNDARY", 32), M(Ee, "EMPTY_ALL", -1), Ee);
const pC = (r = [], e = 0) => {
  const t = /* @__PURE__ */ Object.create(null);
  for (let n = 0; n < r.length; n++) {
    const s = r[n], i = e + n;
    t[s] = i, t[i] = s;
  }
  return Object.freeze(t);
};
var fn, er = (fn = class {
  getEncoding() {
    throw Error("not implemented");
  }
  /** @returns {string} */
  asCharSequence() {
    throw Error("not implemented");
  }
  /** @returns {Uint8Array|number[]} */
  asBytes() {
    throw Error("not implemented");
  }
  /** @returns {number} */
  length() {
    throw Error("not implemented");
  }
  /**
  *
  * @returns {boolean}
  */
  isUTF8Encoding() {
    return this.getEncoding() === fn.Encoding.UTF_8;
  }
  /**
  *
  * @returns {boolean}
  */
  isUTF16Encoding() {
    return this.getEncoding() === fn.Encoding.UTF_16;
  }
}, M(fn, "Encoding", pC(["UTF_16", "UTF_8"])), fn), jc = class extends er {
  /** @param {Uint8Array|number[]|null} bytes */
  constructor(r = null) {
    super(), this.bytes = r;
  }
  getEncoding() {
    return er.Encoding.UTF_8;
  }
  /**
  *
  * @returns {string}
  */
  asCharSequence() {
    return W.utf8ByteArrayToString(this.bytes);
  }
  /**
  *
  * @returns {Uint8Array|number[]|null}
  */
  asBytes() {
    return this.bytes;
  }
  /**
  *
  * @returns {number}
  */
  length() {
    return this.bytes.length;
  }
}, LE = class extends er {
  /** @param {string|null} charSequence */
  constructor(r = null) {
    super(), this.charSequence = r;
  }
  getEncoding() {
    return er.Encoding.UTF_16;
  }
  /**
  *
  * @returns {string}
  */
  asCharSequence() {
    return this.charSequence;
  }
  /**
  *
  * @returns {number[]}
  */
  asBytes() {
    return W.stringToUtf8ByteArray(this.charSequence.toString());
  }
  /**
  *
  * @returns {number}
  */
  length() {
    return this.charSequence.length;
  }
}, Kn = class {
  /**
  * Return the MatcherInput for UTF_16 encoding.
  * @returns {Utf16MatcherInput}
  */
  static utf16(r) {
    return new LE(r);
  }
  /**
  * Return the MatcherInput for UTF_8 encoding.
  * @returns {Utf8MatcherInput}
  */
  static utf8(r) {
    return W.isByteArray(r) ? new jc(r) : new jc(W.stringToUtf8ByteArray(r));
  }
}, Ze = class {
  static EOF() {
    return -8;
  }
  constructor() {
    this.end = 0;
  }
  canCheckPrefix() {
    return !0;
  }
  endPos() {
    return this.end;
  }
  hasString() {
    return !1;
  }
  hasAnyString() {
    return !1;
  }
  prefixLength() {
    return 0;
  }
}, kE = class extends Ze {
  constructor(r, e = 0, t = r.length) {
    super(), this.bytes = r, this.start = e, this.end = t;
  }
  hasString(r, e) {
    const t = r.bytes;
    if (t.length === 0) return !0;
    const n = this.indexOf(this.bytes, t, this.start + e);
    return n !== -1 && n <= this.end - t.length;
  }
  hasAnyString(r, e) {
    return r.ac8 ? r.ac8.searchUTF8(this.bytes, this.start + e, this.end) : !1;
  }
  step(r) {
    if (r += this.start, r >= this.end) return Ze.EOF();
    const e = this.bytes[r] & 255;
    if (e < 128) return e << 3 | 1;
    if (e >= 194 && e <= 223 && r + 1 < this.end) {
      const t = this.bytes[r + 1] & 255;
      return (t & 192) !== 128 ? e << 3 | 1 : ((e & 31) << 6 | t & 63) << 3 | 2;
    } else if (e >= 224 && e <= 239 && r + 2 < this.end) {
      const t = this.bytes[r + 1] & 255;
      if ((t & 192) !== 128) return e << 3 | 1;
      const n = this.bytes[r + 2] & 255;
      return (n & 192) !== 128 ? e << 3 | 1 : ((e & 15) << 12 | (t & 63) << 6 | n & 63) << 3 | 3;
    } else if (e >= 240 && e <= 244 && r + 3 < this.end) {
      const t = this.bytes[r + 1] & 255;
      if ((t & 192) !== 128) return e << 3 | 1;
      const n = this.bytes[r + 2] & 255;
      if ((n & 192) !== 128) return e << 3 | 1;
      const s = this.bytes[r + 3] & 255;
      return (s & 192) !== 128 ? e << 3 | 1 : ((e & 7) << 18 | (t & 63) << 12 | (n & 63) << 6 | s & 63) << 3 | 4;
    } else return e << 3 | 1;
  }
  index(r, e) {
    e += this.start;
    const t = this.indexOf(this.bytes, r.prefixUTF8, e);
    return t < 0 ? t : t - e;
  }
  context(r) {
    r += this.start;
    let e = -1;
    if (r > this.start && r <= this.end) {
      let n = r - 1;
      if (e = this.bytes[n--], e >= 128) {
        let s = r - 4;
        for (s < this.start && (s = this.start); n >= s && (this.bytes[n] & 192) === 128; ) n--;
        n < this.start && (n = this.start), e = this.step(n - this.start) >> 3;
      }
    }
    const t = r < this.end ? this.step(r - this.start) >> 3 : -1;
    return W.emptyOpContext(e, t);
  }
  indexOf(r, e, t = 0) {
    let n = e.length;
    if (n === 0) return t <= this.end ? t : -1;
    const s = e[0];
    let i = this.end - n;
    const o = typeof r.indexOf == "function";
    let B = t;
    for (; B <= i; ) {
      if (o) {
        if (B = r.indexOf(s, B), B === -1 || B > i) return -1;
      } else {
        for (; B <= i && r[B] !== s; ) B++;
        if (B > i) return -1;
      }
      let u = !0;
      for (let c = 1; c < n; c++) if (r[B + c] !== e[c]) {
        u = !1;
        break;
      }
      if (u) return B;
      B++;
    }
    return -1;
  }
  prefixLength(r) {
    return r.prefixUTF8.length;
  }
}, VE = class extends Ze {
  constructor(r, e = 0, t = r.length) {
    super(), this.charSequence = r, this.start = e, this.end = t;
  }
  hasString(r, e) {
    const t = this.charSequence.indexOf(r.str, this.start + e);
    return t !== -1 && t <= this.end - r.str.length;
  }
  hasAnyString(r, e) {
    return r.ac16 ? r.ac16.searchUTF16(this.charSequence, this.start + e, this.end) : !1;
  }
  step(r) {
    if (r += this.start, r >= this.end) return Ze.EOF();
    const e = this.charSequence.charCodeAt(r);
    if (e < K.MIN_HIGH_SURROGATE || e > K.MAX_HIGH_SURROGATE || r + 1 >= this.end) return e << 3 | 1;
    const t = this.charSequence.charCodeAt(r + 1);
    return t >= K.MIN_LOW_SURROGATE && t <= K.MAX_LOW_SURROGATE ? (e - K.MIN_HIGH_SURROGATE) * 1024 + (t - K.MIN_LOW_SURROGATE) + K.MIN_SUPPLEMENTARY_CODE_POINT << 3 | 2 : e << 3 | 1;
  }
  index(r, e) {
    e += this.start;
    const t = this.charSequence.indexOf(r.prefix, e);
    return t < 0 || t > this.end - r.prefix.length ? -1 : t - e;
  }
  context(r) {
    r += this.start;
    const e = r > this.start && r <= this.end ? this.charSequence.charCodeAt(r - 1) : -1, t = r < this.end ? this.charSequence.charCodeAt(r) : -1;
    return W.emptyOpContext(e, t);
  }
  prefixLength(r) {
    return r.prefix.length;
  }
}, me = class {
  static fromUTF8(r, e = 0, t = r.length) {
    return new kE(r, e, t);
  }
  static fromUTF16(r, e = 0, t = r.length) {
    return new VE(r, e, t);
  }
}, Xs = class extends Error {
  /** @param {string} message */
  constructor(r) {
    super(r), this.name = "RE2JSException";
  }
}, pe = class extends Xs {
  /**
  * @param {string} error
  * @param {string|null} [input=null]
  */
  constructor(r, e = null) {
    let t = `error parsing regexp: ${r}`;
    e && (t += `: \`${e}\``), super(t), this.name = "RE2JSSyntaxException", this.message = t, this.error = r, this.input = e;
  }
  /**
  * Retrieves the description of the error.
  * @returns {string}
  */
  getDescription() {
    return this.error;
  }
  /**
  * Retrieves the erroneous regular-expression pattern.
  * @returns {string|null}
  */
  getPattern() {
    return this.input;
  }
}, xE = class extends Xs {
  /** @param {string} message */
  constructor(r) {
    super(r), this.name = "RE2JSCompileException";
  }
}, tt = class extends Xs {
  /** @param {string} message */
  constructor(r) {
    super(r), this.name = "RE2JSGroupException";
  }
}, ME = class extends Xs {
  /** @param {string} message */
  constructor(r) {
    super(r), this.name = "RE2JSFlagsException";
  }
}, gs = class extends Xs {
  /** @param {string} message */
  constructor(r) {
    super(r), this.name = "RE2JSInternalException";
  }
}, Qn, qc = (Qn = class {
  /**
  * Quotes '\' and '$' in {@code s}, so that the returned string could be used in
  * {@link #appendReplacement} as a literal replacement of {@code s}.
  *
  * @param {string} str the string to be quoted
  * @param {boolean} [javaMode=false] whether the replacement will be used in javaMode
  * @returns {string} the quoted string
  */
  static quoteReplacement(e, t = !1) {
    return t ? e.indexOf("\\") < 0 && e.indexOf("$") < 0 ? e : e.split("").map((n) => {
      const s = n.codePointAt(0);
      return s === b.CODES.get("\\") || s === b.CODES.get("$") ? `\\${n}` : n;
    }).join("") : e.indexOf("$") < 0 ? e : e.split("").map((n) => n.codePointAt(0) === b.CODES.get("$") ? "$$" : n).join("");
  }
  /**
  *
  * @param {import('./index.js').RE2JS} pattern
  * @param {string|number[]|Uint8Array|MatcherInputBase} input
  */
  constructor(e, t) {
    if (e === null) throw new Error("pattern is null");
    this.patternInput = e;
    const n = this.patternInput.re2();
    this.patternGroupCount = n.numberOfCapturingGroups(), this.groups = [], this.namedGroups = n.namedGroups, this.numberOfInstructions = n.numberOfInstructions(), t instanceof er ? this.resetMatcherInput(t) : W.isByteArray(t) ? this.resetMatcherInput(Kn.utf8(t)) : this.resetMatcherInput(Kn.utf16(t));
  }
  /**
  * Returns the {@code RE2JS} associated with this {@code Matcher}.
  * @returns {import('./index.js').RE2JS}
  */
  pattern() {
    return this.patternInput;
  }
  /**
  * Resets the {@code Matcher}, rewinding input and discarding any match information.
  *
  * @returns {Matcher} the {@code Matcher} itself, for chained method calls
  */
  reset() {
    return this.matcherInputLength = this.matcherInput.length(), this.appendPos = 0, this.hasMatch = !1, this.hasGroups = !1, this.anchorFlag = 0, this;
  }
  /**
  * Resets the {@code Matcher} and changes the input.
  * @param {string|number[]|Uint8Array|MatcherInputBase} input
  * @returns {Matcher} the {@code Matcher} itself, for chained method calls
  */
  resetMatcherInput(e) {
    if (e === null) throw new Error("input is null");
    return e instanceof er || (W.isByteArray(e) ? e = Kn.utf8(e) : e = Kn.utf16(e)), this.matcherInput = e, this.reset(), this;
  }
  /**
  * Returns the start of the named group of the most recent match, or -1 if the group was not
  * matched.
  * @param {string|number} [group=0]
  * @returns {number}
  */
  start(e = 0) {
    if (typeof e == "string") {
      const t = this.namedGroups[e];
      if (!Number.isFinite(t)) throw new tt(`group '${e}' not found`);
      e = t;
    }
    return this.loadGroup(e), this.groups[2 * e];
  }
  /**
  * Returns the end of the named group of the most recent match, or -1 if the group was not
  * matched.
  * @param {string|number} [group=0]
  * @returns {number}
  */
  end(e = 0) {
    if (typeof e == "string") {
      const t = this.namedGroups[e];
      if (!Number.isFinite(t)) throw new tt(`group '${e}' not found`);
      e = t;
    }
    return this.loadGroup(e), this.groups[2 * e + 1];
  }
  /**
  * Returns the program size of this pattern.
  *
  * <p>
  * Similar to the C++ implementation, the program size is a very approximate measure of a regexp's
  * "cost". Larger numbers are more expensive than smaller numbers.
  * </p>
  *
  * @returns {number} the program size of this pattern
  */
  programSize() {
    return this.numberOfInstructions;
  }
  /**
  * Returns the named group of the most recent match, or {@code null} if the group was not matched.
  * @param {string|number} [group=0]
  * @returns {string|null}
  */
  group(e = 0) {
    if (typeof e == "string") {
      const s = this.namedGroups[e];
      if (!Number.isFinite(s)) throw new tt(`group '${e}' not found`);
      e = s;
    }
    const t = this.start(e), n = this.end(e);
    return t < 0 && n < 0 ? null : this.substring(t, n);
  }
  /**
  * Returns a dictionary map of all named capturing groups and their matched values.
  * If a group was not matched, its value will be `null`.
  * @returns {Record<string, string|null>}
  */
  getNamedGroups() {
    if (!this.hasMatch) throw new tt("perhaps no match attempted");
    const e = /* @__PURE__ */ Object.create(null);
    for (const t of Object.keys(this.namedGroups)) e[t] = this.group(t);
    return e;
  }
  /**
  * Returns the number of subgroups in this pattern.
  *
  * @returns {number} the number of subgroups; the overall match (group 0) does not count
  */
  groupCount() {
    return this.patternGroupCount;
  }
  /**
  * Helper: finds subgroup information if needed for group.
  * @param {number} group
  * @private
  */
  loadGroup(e) {
    if (e < 0 || e > this.patternGroupCount) throw new tt(`Group index out of bounds: ${e}`);
    if (!this.hasMatch) throw new tt("perhaps no match attempted");
    if (e === 0 || this.hasGroups) return;
    const t = this.matcherInputLength, n = this.patternInput.re2().matchMachineInput(this.matcherInput, this.groups[0], t, this.anchorFlag, 1 + this.patternGroupCount);
    if (!n[0]) throw new tt("inconsistency in matching group data");
    this.groups = n[1], this.hasGroups = !0;
  }
  /**
  * Matches the entire input against the pattern (anchored start and end). If there is a match,
  * {@code matches} sets the match state to describe it.
  *
  * @returns {boolean} true if the entire input matches the pattern
  */
  matches() {
    return this.genMatch(0, V.ANCHOR_BOTH);
  }
  /**
  * Matches the beginning of input against the pattern (anchored start). If there is a match,
  * {@code lookingAt} sets the match state to describe it.
  *
  * @returns {boolean} true if the beginning of the input matches the pattern
  */
  lookingAt() {
    return this.genMatch(0, V.ANCHOR_START);
  }
  /**
  * Matches the input against the pattern (unanchored), starting at a specified position. If there
  * is a match, {@code find} sets the match state to describe it.
  *
  * @param {number|null} [start=null] the input position where the search begins
  * @returns {boolean} if it finds a match
  * @throws IndexOutOfBoundsException if start is not a valid input position
  */
  find(e = null) {
    if (e !== null) {
      if (e < 0 || e > this.matcherInputLength) throw new tt(`start index out of bounds: ${e}`);
      return this.reset(), this.genMatch(e, 0);
    }
    if (e = 0, this.hasMatch && (e = this.groups[1], this.groups[0] === this.groups[1])) {
      const t = (this.matcherInput.isUTF16Encoding() ? me.fromUTF16(this.matcherInput.asCharSequence(), 0, this.matcherInputLength) : me.fromUTF8(this.matcherInput.asBytes(), 0, this.matcherInputLength)).step(e);
      t < 0 ? e++ : e += t & 7;
    }
    return this.genMatch(e, V.UNANCHORED);
  }
  /**
  * Helper: does match starting at start, with RE2 anchor flag.
  * @param {number} startByte
  * @param {number} anchor
  * @returns {boolean}
  * @private
  */
  genMatch(e, t) {
    const n = this.patternInput.re2().matchMachineInput(this.matcherInput, e, this.matcherInputLength, t, 1);
    return n[0] ? (this.groups = n[1], this.hasMatch = !0, this.hasGroups = this.patternGroupCount === 0, this.anchorFlag = t, !0) : (this.hasMatch = !1, !1);
  }
  /**
  * Helper: return substring for [start, end).
  * @param {number} start
  * @param {number} end
  * @returns {string}
  */
  substring(e, t) {
    return this.matcherInput.isUTF8Encoding() ? W.utf8ByteArrayToString(this.matcherInput.asBytes().slice(e, t)) : this.matcherInput.asCharSequence().substring(e, t).toString();
  }
  /**
  * Helper for Pattern: return input length.
  * @returns {number}
  */
  inputLength() {
    return this.matcherInputLength;
  }
  /**
  * Appends to result two strings: the text from the append position up to the beginning of the
  * most recent match, and then the replacement with submatch groups substituted for references of
  * the form {@code $n}, where {@code n} is the group number in decimal. It advances the append
  * position to where the most recent match ended.
  *
  * To embed a literal {@code $}, use \$ (actually {@code "\\$"} with string escapes). The escape
  * is only necessary when {@code $} is followed by a digit, but it is always allowed. Only
  * {@code $} and {@code \} need escaping, but any character can be escaped.
  *
  * The group number {@code n} in {@code $n} is always at least one digit and expands to use more
  * digits as long as the resulting number is a valid group number for this pattern. To cut it off
  * earlier, escape the first digit that should not be used.
  *
  * @param {string} replacement the replacement string
  * @param {boolean} [javaMode=false] activate java mode (different behaviour for capture groups and special characters)
  * @returns {string}
  * @throws IllegalStateException if there was no most recent match
  * @throws IndexOutOfBoundsException if replacement refers to an invalid group
  * @private
  */
  appendReplacement(e, t = !1) {
    let n = "";
    const s = this.start(), i = this.end();
    return this.appendPos < s && (n += this.substring(this.appendPos, s)), this.appendPos = i, n += t ? this.appendReplacementInternalJava(e) : this.appendReplacementInternalJs(e), n;
  }
  /**
  * @param {string} replacement - the replacement string
  * @returns {string}
  * @private
  */
  appendReplacementInternalJava(e) {
    let t = "", n = 0;
    const s = e.length;
    let i = 0;
    for (; i < s; ) {
      const o = e.codePointAt(i);
      if (o === b.CODES.get("\\")) {
        if (n < i && (t += e.substring(n, i)), i++, i >= s) throw new tt("character to be escaped is missing");
        n = i, i++;
        continue;
      }
      if (o === b.CODES.get("$")) {
        if (n < i && (t += e.substring(n, i)), i + 1 >= s) throw new tt("Illegal group reference: group index is missing");
        const B = e.codePointAt(i + 1);
        if (b.CODES.get("0") <= B && B <= b.CODES.get("9")) {
          let u = B - b.CODES.get("0"), c = i + 2;
          for (; c < s; c++) {
            const f = e.codePointAt(c);
            if (f < b.CODES.get("0") || f > b.CODES.get("9") || u * 10 + f - b.CODES.get("0") > this.patternGroupCount) break;
            u = u * 10 + f - b.CODES.get("0");
          }
          if (u > this.patternGroupCount) throw new tt(`n > number of groups: ${u}`);
          const C = this.group(u);
          C !== null && (t += C), i = c, n = i;
        } else if (B === b.CODES.get("{")) {
          let u = i + 2;
          for (; u < s && e.codePointAt(u) !== b.CODES.get("}"); ) u++;
          if (u >= s) throw new tt("named capture group is missing trailing '}'");
          const c = e.substring(i + 2, u), C = this.group(c);
          C !== null && (t += C), i = u + 1, n = i;
        } else throw new tt("Illegal group reference");
        continue;
      }
      i++;
    }
    return n < s && (t += e.substring(n, s)), t;
  }
  /**
  * @param {string} replacement - the replacement string
  * @returns {string}
  * @private
  */
  appendReplacementInternalJs(e) {
    let t = "", n = 0;
    const s = e.length;
    for (let i = 0; i < s - 1; i++) if (e.codePointAt(i) === b.CODES.get("$")) {
      let o = e.codePointAt(i + 1);
      if (b.CODES.get("$") === o) {
        n < i && (t += e.substring(n, i)), t += "$", i++, n = i + 1;
        continue;
      } else if (b.CODES.get("&") === o) {
        n < i && (t += e.substring(n, i));
        const B = this.group(0);
        B !== null ? t += B : t += "$&", i++, n = i + 1;
        continue;
      } else if (b.CODES.get("`") === o) {
        n < i && (t += e.substring(n, i)), t += this.substring(0, this.start(0)), i++, n = i + 1;
        continue;
      } else if (b.CODES.get("'") === o) {
        n < i && (t += e.substring(n, i)), t += this.substring(this.end(0), this.matcherInputLength), i++, n = i + 1;
        continue;
      } else if (b.CODES.get("1") <= o && o <= b.CODES.get("9")) {
        let B = o - b.CODES.get("0");
        for (n < i && (t += e.substring(n, i)), i += 2; i < s && (o = e.codePointAt(i), !(o < b.CODES.get("0") || o > b.CODES.get("9") || B * 10 + o - b.CODES.get("0") > this.patternGroupCount)); i++)
          B = B * 10 + o - b.CODES.get("0");
        if (B > this.patternGroupCount) {
          t += `$${B}`, n = i, i--;
          continue;
        }
        const u = this.group(B);
        u !== null && (t += u), n = i, i--;
        continue;
      } else if (o === b.CODES.get("<")) {
        n < i && (t += e.substring(n, i)), i++;
        let B = i + 1;
        for (; B < e.length && e.codePointAt(B) !== b.CODES.get(">") && e.codePointAt(B) !== b.CODES.get(" "); ) B++;
        if (B === e.length || e.codePointAt(B) !== b.CODES.get(">")) {
          t += e.substring(i - 1, B + 1), n = B + 1, i = B;
          continue;
        }
        const u = e.substring(i + 1, B);
        if (Object.prototype.hasOwnProperty.call(this.namedGroups, u)) {
          const c = this.group(u);
          c !== null && (t += c);
        } else t += `$<${u}>`;
        n = B + 1, i = B;
        continue;
      }
    }
    return n < s && (t += e.substring(n, s)), t;
  }
  /**
  * Return the substring of the input from the append position to the end of the
  * input.
  * @returns {string}
  */
  appendTail() {
    return this.substring(this.appendPos, this.matcherInputLength);
  }
  /**
  * Returns the input with all matches replaced by {@code replacement}, interpreted as for
  * {@code appendReplacement}.
  *
  * @param {string|((...args: any[]) => string)} replacement - the replacement string or a replacer function
  * @param {boolean} [javaMode=false] - activate java mode (different behaviour for capture groups and special characters)
  * @returns {string} the input string with the matches replaced
  * @throws IndexOutOfBoundsException if replacement refers to an invalid group and javaMode is true
  */
  replaceAll(e, t = !1) {
    return this.replace(e, !0, t);
  }
  /**
  * Returns the input with the first match replaced by {@code replacement}, interpreted as for
  * {@code appendReplacement}.
  *
  * @param {string|((...args: any[]) => string)} replacement - the replacement string or a replacer function
  * @param {boolean} [javaMode=false] - activate java mode (different behaviour for capture groups and special characters)
  * @returns {string} the input string with the first match replaced
  * @throws IndexOutOfBoundsException if replacement refers to an invalid group and javaMode is true
  */
  replaceFirst(e, t = !1) {
    return this.replace(e, !1, t);
  }
  /**
  * Helper: replaceAll/replaceFirst hybrid.
  * @param {string|((...args: any[]) => string)} replacement - the replacement string or a replacer function
  * @param {boolean} [all=true] - replace all matches
  * @param {boolean} [javaMode=false] - activate java mode (different behaviour for capture groups and special characters)
  * @returns {string}
  * @private
  */
  replace(e, t = !0, n = !1) {
    let s = "";
    this.reset();
    const i = typeof e == "function", o = Object.keys(this.namedGroups).length > 0;
    let B = null;
    if (i) {
      if (this.groupCount() >= Qn.MAX_REPLACER_ARGS) throw new tt("Too many capture groups to safely invoke replacer function");
      B = this.matcherInput.isUTF8Encoding() ? this.matcherInput.asBytes() : this.matcherInput.asCharSequence();
    }
    for (; this.find() && (s += i ? this.appendReplacementFunc(e, o, B) : this.appendReplacement(e, n), !!t); )
      ;
    return s += this.appendTail(), s;
  }
  /**
  * Evaluates a replacer function for the current match and appends the result,
  * along with any un-matched preceding text, advancing the append position.
  * @param {Function} replacer - the replacer function
  * @param {boolean} hasNamedGroups - cached flag if pattern has named groups
  * @param {string|Uint8Array|number[]} originalInput - the cached original input reference
  * @returns {string} the evaluated string to append
  * @private
  */
  appendReplacementFunc(e, t, n) {
    let s = "";
    const i = this.start(), o = this.end();
    this.appendPos < i && (s += this.substring(this.appendPos, i)), this.appendPos = o;
    const B = this.buildReplacerArgs(i, t, n);
    return s += String(e(...B)), s;
  }
  /**
  * Builds the argument array for the replacer function matching the standard
  * JS String.prototype.replace(regex, replacer) signature.
  * @param {number} matchStart - the start index of the match
  * @param {boolean} hasNamedGroups - cached flag if pattern has named groups
  * @param {string|Uint8Array|number[]} originalInput - the cached original input reference
  * @returns {Array} array of arguments
  * @private
  */
  buildReplacerArgs(e, t, n) {
    const s = [this.group(0)], i = this.groupCount();
    for (let o = 1; o <= i; o++) {
      const B = this.start(o);
      B < 0 ? s.push(void 0) : s.push(this.substring(B, this.end(o)));
    }
    if (s.push(e), s.push(n), t) {
      const o = this.getNamedGroups();
      for (const B in o) o[B] === null && (o[B] = void 0);
      s.push(o);
    }
    return s;
  }
}, /**
* V8 and WebKit have historical hard limits on the number of arguments
* that can be passed to a function. We cap replacer arguments to prevent
* Call Stack Overflow (DoS) vulnerabilities on massive ASTs.
*/
M(Qn, "MAX_REPLACER_ARGS", 65535), Qn), Be, N = (Be = class {
  static isRuneOp(e) {
    return Be.RUNE <= e && e <= Be.RUNE_ANY_NOT_NL;
  }
  static escapeRunes(e) {
    let t = '"';
    for (let n of e) t += W.escapeRune(n);
    return t += '"', t;
  }
  constructor(e) {
    this.op = e, this.out = 0, this.arg = 0, this.runes = [], this.next = null;
  }
  matchRune(e) {
    if (this.runes.length === 1) {
      const o = this.runes[0];
      return (this.arg & V.FOLD_CASE) !== 0 ? K.equalsIgnoreCase(o, e) : e === o;
    }
    const t = this.runes.length;
    if (t === 0) return !1;
    if (t === 2 || t === 4 || t === 6 || t === 8) {
      for (let o = 0; o < t; o += 2) {
        if (e < this.runes[o]) return !1;
        if (e <= this.runes[o + 1]) return !0;
      }
      return !1;
    }
    let n = 0, s = t >> 1;
    for (; s > 1; ) {
      const o = s >> 1;
      n += this.runes[n + o << 1] <= e ? o : 0, s -= o;
    }
    n += this.runes[n << 1] <= e ? 1 : 0;
    const i = n - 1;
    return i >= 0 && e <= this.runes[i << 1 | 1];
  }
  matchRunePos(e) {
    if (this.runes.length === 1) {
      const o = this.runes[0];
      return (this.arg & V.FOLD_CASE) !== 0 ? K.equalsIgnoreCase(o, e) ? 0 : -1 : e === o ? 0 : -1;
    }
    const t = this.runes.length;
    if (t === 0) return -1;
    if (t === 2 || t === 4 || t === 6 || t === 8) {
      for (let o = 0; o < t; o += 2) {
        if (e < this.runes[o]) return -1;
        if (e <= this.runes[o + 1]) return Math.floor(o / 2);
      }
      return -1;
    }
    let n = 0, s = t >> 1;
    for (; s > 1; ) {
      const o = s >> 1;
      n += this.runes[n + o << 1] <= e ? o : 0, s -= o;
    }
    n += this.runes[n << 1] <= e ? 1 : 0;
    const i = n - 1;
    return i >= 0 && e <= this.runes[i << 1 | 1] ? i : -1;
  }
  /**
  *
  * @returns {string}
  */
  toString() {
    switch (this.op) {
      case Be.ALT:
        return `alt -> ${this.out}, ${this.arg}`;
      case Be.ALT_MATCH:
        return `altmatch -> ${this.out}, ${this.arg}`;
      case Be.CAPTURE:
        return `cap ${this.arg} -> ${this.out}`;
      case Be.EMPTY_WIDTH:
        return `empty ${this.arg} -> ${this.out}`;
      case Be.MATCH:
        return `match${this.arg !== 0 ? ` ${this.arg}` : ""}`;
      case Be.FAIL:
        return "fail";
      case Be.NOP:
        return `nop -> ${this.out}`;
      case Be.LB_WRITE:
        return `lbwrite ${this.arg} -> ${this.out}`;
      case Be.LB_CHECK:
        return `lbcheck ${this.arg} -> ${this.out}`;
      case Be.RUNE:
        return this.runes === null ? "rune <null>" : [
          "rune ",
          Be.escapeRunes(this.runes),
          (this.arg & V.FOLD_CASE) !== 0 ? "/i" : "",
          " -> ",
          this.out
        ].join("");
      case Be.RUNE1:
        return `rune1 ${Be.escapeRunes(this.runes)} -> ${this.out}`;
      case Be.RUNE_ANY:
        return `any -> ${this.out}`;
      case Be.RUNE_ANY_NOT_NL:
        return `anynotnl -> ${this.out}`;
      default:
        throw new Error("unhandled case in Inst.toString");
    }
  }
}, M(Be, "ALT", 1), M(Be, "ALT_MATCH", 2), M(Be, "CAPTURE", 3), M(Be, "EMPTY_WIDTH", 4), M(Be, "FAIL", 5), M(Be, "MATCH", 6), M(Be, "NOP", 7), M(Be, "RUNE", 8), M(Be, "RUNE1", 9), M(Be, "RUNE_ANY", 10), M(Be, "RUNE_ANY_NOT_NL", 11), M(Be, "LB_WRITE", 12), M(Be, "LB_CHECK", 13), Be), Kc = class {
  constructor(r) {
    this.sparse = new Int32Array(r), this.densePcs = new Int32Array(r), this.denseCaps = null, this.size = 0, this.ncap = 0;
  }
  init(r) {
    this.ncap = r;
    const e = this.densePcs.length * r;
    (!this.denseCaps || this.denseCaps.length < e) && (this.denseCaps = new Int32Array(e));
  }
  contains(r) {
    const e = this.sparse[r];
    return e < this.size && this.densePcs[e] === r;
  }
  isEmpty() {
    return this.size === 0;
  }
  add(r) {
    const e = this.size++;
    return this.sparse[r] = e, this.densePcs[e] = r, e;
  }
  clear() {
    this.size = 0;
  }
  toString() {
    let r = "{";
    for (let e = 0; e < this.size; e++)
      e !== 0 && (r += ", "), r += this.densePcs[e];
    return r += "}", r;
  }
}, GE = class Ha {
  static fromRE2(e) {
    const t = new Ha();
    return t.prog = e.prog, t.re2 = e, t.q0 = new Kc(t.prog.numInst()), t.q1 = new Kc(t.prog.numInst()), t.matched = !1, t.matchcap = new Int32Array(t.prog.numCap < 2 ? 2 : t.prog.numCap), t.ncap = 0, t;
  }
  static fromMachine(e) {
    return Ha.fromRE2(e.re2);
  }
  constructor() {
    this.prog = null, this.re2 = null, this.q0 = null, this.q1 = null, this.matched = !1, this.matchcap = null, this.ncap = 0, this.lbTable = null;
  }
  init(e) {
    this.ncap = e, e > this.matchcap.length ? this.matchcap = new Int32Array(e).fill(-1) : this.matchcap.fill(-1), this.q0.init(e), this.q1.init(e), this.prog.numLb > 0 && ((!this.lbTable || this.lbTable.length < this.prog.numLb + 1) && (this.lbTable = new Int32Array(this.prog.numLb + 1)), this.lbTable.fill(-1));
  }
  submatches() {
    return this.ncap === 0 ? W.emptyInts() : W.toArray(this.matchcap.subarray(0, this.ncap));
  }
  match(e, t, n) {
    const s = this.re2.cond;
    if (s === W.EMPTY_ALL || (n === V.ANCHOR_START || n === V.ANCHOR_BOTH) && t !== 0) return !1;
    this.matched = !1, this.matchcap.fill(-1);
    let i = this.prog.numLb > 0 ? 0 : t, o = t, B = this.q0, u = this.q1, c = e.step(i), C = c >> 3, f = c & 7, m = -1, R = 0;
    c !== Ze.EOF() && (c = e.step(i + f), m = c >> 3, R = c & 7);
    let P;
    for (i === 0 ? P = W.emptyOpContext(-1, C) : P = e.context(i); ; ) {
      if (B.isEmpty()) {
        if ((s & W.EMPTY_BEGIN_TEXT) !== 0 && i !== 0 || (n === V.ANCHOR_START || n === V.ANCHOR_BOTH) && i !== 0 || this.matched) break;
        if (this.prog.numLb === 0 && this.re2.prefix.length !== 0 && m !== this.re2.prefixRune && e.canCheckPrefix()) {
          const z = e.index(this.re2, i);
          if (z < 0) break;
          i += z, c = e.step(i), C = c >> 3, f = c & 7, c = e.step(i + f), m = c >> 3, R = c & 7, P = e.context(i);
        }
      }
      if (i === 0 && this.prog.numLb > 0) for (let z = 0; z < this.prog.lbStarts.length; z++) this.add(B, this.prog.lbStarts[z], i, this.matchcap, 0, P);
      !this.matched && (i === 0 || n === V.UNANCHORED) && i >= o && (this.ncap > 0 && (this.matchcap[0] = i), this.add(B, this.prog.start, i, this.matchcap, 0, P));
      const x = i + f;
      if (P = e.context(x), this.step(B, u, i, x, C, P, n, i === e.endPos()), f === 0 || this.ncap === 0 && this.matched) break;
      i += f, C = m, f = R, C !== -1 && (c = e.step(i + f), m = c >> 3, R = c & 7);
      const H = B;
      B = u, u = H;
    }
    return u.clear(), this.matched;
  }
  matchSet(e, t, n) {
    const s = this.re2.cond;
    if (s === W.EMPTY_ALL) return [];
    if ((n === V.ANCHOR_START || n === V.ANCHOR_BOTH) && t !== 0) return [];
    let i = this.prog.numLb > 0 ? 0 : t, o = t, B = this.q0, u = this.q1, c = e.step(i), C = c >> 3, f = c & 7, m = -1, R = 0;
    c !== Ze.EOF() && (c = e.step(i + f), m = c >> 3, R = c & 7);
    let P = i === 0 ? W.emptyOpContext(-1, C) : e.context(i);
    const x = /* @__PURE__ */ new Set();
    for (; !(B.isEmpty() && ((s & W.EMPTY_BEGIN_TEXT) !== 0 && i !== 0 || (n === V.ANCHOR_START || n === V.ANCHOR_BOTH) && i !== 0)); ) {
      if (i === 0 && this.prog.numLb > 0) for (let se = 0; se < this.prog.lbStarts.length; se++) this.add(B, this.prog.lbStarts[se], i, this.matchcap, 0, P);
      (i === 0 || n === V.UNANCHORED) && i >= o && this.add(B, this.prog.start, i, this.matchcap, 0, P);
      const H = i + f;
      P = e.context(H);
      for (let se = 0; se < B.size; se++) {
        const De = B.densePcs[se], ve = this.prog.inst[De], ct = se * this.ncap;
        let we = !1;
        switch (ve.op) {
          case N.MATCH:
            if (n === V.ANCHOR_BOTH && i !== e.endPos()) break;
            x.add(ve.arg);
            break;
          case N.RUNE:
            we = ve.matchRune(C);
            break;
          case N.RUNE1:
            we = C === ve.runes[0];
            break;
          case N.RUNE_ANY:
            we = !0;
            break;
          case N.RUNE_ANY_NOT_NL:
            we = C !== 10;
            break;
          default:
            continue;
        }
        we && this.add(u, ve.out, H, B.denseCaps, ct, P);
      }
      if (B.clear(), f === 0) break;
      i += f, C = m, f = R, C !== -1 && (c = e.step(i + f), m = c >> 3, R = c & 7);
      const z = B;
      B = u, u = z;
    }
    return u.clear(), Array.from(x).sort((H, z) => H - z);
  }
  step(e, t, n, s, i, o, B, u) {
    const c = this.re2.longest;
    for (let C = 0; C < e.size; C++) {
      const f = e.densePcs[C], m = C * this.ncap;
      if (c && this.matched && this.ncap > 0 && this.matchcap[0] < e.denseCaps[m]) continue;
      const R = this.prog.inst[f];
      let P = !1;
      switch (R.op) {
        case N.MATCH:
          if (B === V.ANCHOR_BOTH && !u) break;
          if (this.ncap > 0 && (!c || !this.matched || this.matchcap[1] < n)) {
            e.denseCaps[m + 1] = n;
            for (let x = 0; x < this.ncap; x++) this.matchcap[x] = e.denseCaps[m + x];
          }
          c || (e.size = 0), this.matched = !0;
          break;
        case N.RUNE:
          P = R.matchRune(i);
          break;
        case N.RUNE1:
          P = i === R.runes[0];
          break;
        case N.RUNE_ANY:
          P = !0;
          break;
        case N.RUNE_ANY_NOT_NL:
          P = i !== 10;
          break;
        default:
          continue;
      }
      P && this.add(t, R.out, s, e.denseCaps, m, o);
    }
    e.clear();
  }
  add(e, t, n, s, i, o) {
    for (; ; ) {
      if (t === 0 || e.contains(t)) return;
      const B = e.add(t), u = this.prog.inst[t];
      switch (u.op) {
        case N.FAIL:
          return;
        case N.ALT:
        case N.ALT_MATCH:
          this.add(e, u.out, n, s, i, o), t = u.arg;
          continue;
        case N.EMPTY_WIDTH:
          if ((u.arg & ~o) === 0) {
            t = u.out;
            continue;
          }
          return;
        case N.NOP:
          t = u.out;
          continue;
        case N.CAPTURE:
          if (u.arg < this.ncap) {
            const c = s[i + u.arg];
            s[i + u.arg] = n, this.add(e, u.out, n, s, i, o), s[i + u.arg] = c;
            return;
          } else {
            t = u.out;
            continue;
          }
        case N.LB_WRITE:
          this.lbTable[Math.abs(u.arg)] = n, t = u.out;
          continue;
        case N.LB_CHECK:
          if (u.arg > 0) {
            if (this.lbTable[u.arg] === n) {
              t = u.out;
              continue;
            }
          } else if (this.lbTable[-u.arg] !== n) {
            t = u.out;
            continue;
          }
          return;
        case N.MATCH:
        case N.RUNE:
        case N.RUNE1:
        case N.RUNE_ANY:
        case N.RUNE_ANY_NOT_NL:
          if (this.ncap > 0) {
            const c = B * this.ncap;
            for (let C = 0; C < this.ncap; C++) e.denseCaps[c + C] = s[i + C];
          }
          return;
        default:
          throw new gs("unhandled");
      }
    }
  }
};
const zc = (r) => {
  let e = -2128831035;
  for (let t = 0; t < r.length; t++)
    e ^= r[t], e = Math.imul(e, 16777619);
  return e;
}, HE = (r, e) => {
  if (r.length !== e.length) return !1;
  for (let t = 0; t < r.length; t++) if (r[t] !== e[t]) return !1;
  return !0;
};
var UE = class {
  constructor(r, e, t = []) {
    this.nfaStates = r, this.isMatch = e, this.matchIDs = t, this.nextLatin1 = new Array(K.MAX_LATIN1 + 1).fill(null), this.nextLatin1Anchored = new Array(K.MAX_LATIN1 + 1).fill(null), this.transKeys = [], this.transVals = [], this.lastSeen = 0;
  }
}, Mt, JE = (Mt = class {
  constructor(e, t = 8388608) {
    this.prog = e, this.stateCache = /* @__PURE__ */ new Map(), this.stateCount = 0, this.startState = null, this.stateLimit = Math.max(1, Math.floor(t / Mt.STATE_MEMORY_ESTIMATE)), this.cacheClears = 0, this.failed = !1, this.clock = 0;
  }
  computeClosure(e) {
    const t = /* @__PURE__ */ new Set(), n = [...e];
    let s = !1;
    const i = [];
    for (; n.length > 0; ) {
      const B = n.pop();
      if (t.has(B)) continue;
      t.add(B);
      const u = this.prog.getInst(B);
      switch (u.op) {
        case N.MATCH:
          s = !0, i.includes(u.arg) || i.push(u.arg);
          break;
        case N.ALT:
        case N.ALT_MATCH:
          n.push(u.out), n.push(u.arg);
          break;
        case N.NOP:
        case N.CAPTURE:
          n.push(u.out);
          break;
        case N.EMPTY_WIDTH:
        case N.LB_WRITE:
        case N.LB_CHECK:
          return null;
      }
    }
    const o = Int32Array.from(t).sort();
    return i.sort((B, u) => B - u), {
      pcs: o,
      isMatch: s,
      matchIDs: i
    };
  }
  getState(e) {
    const t = this.computeClosure(e);
    if (!t) return null;
    const n = t.pcs, s = zc(n);
    let i = this.stateCache.get(s);
    if (i) for (let B = 0; B < i.length; B++) {
      const u = i[B];
      if (HE(u.nfaStates, n))
        return u.lastSeen = ++this.clock, u;
    }
    else
      i = [], this.stateCache.set(s, i);
    if (this.failed) return null;
    if (this.stateCount >= this.stateLimit) {
      if (this.cacheClears++, this.cacheClears >= Mt.MAX_CACHE_CLEARS)
        return this.failed = !0, this.stateCache.clear(), this.stateCount = 0, this.startState = null, null;
      this.evictCache(), i = this.stateCache.get(s), i || (i = [], this.stateCache.set(s, i));
    }
    const o = new UE(n, t.isMatch, t.matchIDs);
    return o.lastSeen = ++this.clock, i.push(o), this.stateCount++, o;
  }
  evictCache() {
    const e = [];
    for (const o of this.stateCache.values()) for (let B = 0; B < o.length; B++) e.push(o[B]);
    e.sort((o, B) => o.lastSeen - B.lastSeen);
    const t = Math.max(1, Math.floor(this.stateLimit / 2)), n = e.length - t, s = e.slice(n), i = new Set(s);
    this.stateCache.clear(), this.stateCount = 0;
    for (let o = 0; o < s.length; o++) {
      const B = s[o];
      B.nextLatin1.fill(null), B.nextLatin1Anchored.fill(null), B.transKeys.length = 0, B.transVals.length = 0;
      const u = zc(B.nfaStates);
      let c = this.stateCache.get(u);
      c || (c = [], this.stateCache.set(u, c)), c.push(B), this.stateCount++;
    }
    this.startState && !i.has(this.startState) && (this.startState = null);
  }
  step(e, t, n) {
    if (t <= K.MAX_LATIN1) if (n === V.UNANCHORED) {
      const o = e.nextLatin1[t];
      if (o !== null) return o;
    } else {
      const o = e.nextLatin1Anchored[t];
      if (o !== null) return o;
    }
    else {
      const o = t + (n === V.UNANCHORED ? 0 : K.MAX_RUNE + 1), B = e.transKeys, u = B.length;
      for (let c = 0; c < u; c++) if (B[c] === o) return e.transVals[c];
    }
    const s = [];
    for (let o = 0; o < e.nfaStates.length; o++) {
      const B = e.nfaStates[o], u = this.prog.getInst(B);
      N.isRuneOp(u.op) && u.matchRune(t) && s.push(u.out);
    }
    n === V.UNANCHORED && s.push(this.prog.start);
    const i = this.getState(s);
    if (t <= K.MAX_LATIN1) n === V.UNANCHORED ? e.nextLatin1[t] = i : e.nextLatin1Anchored[t] = i;
    else {
      const o = t + (n === V.UNANCHORED ? 0 : K.MAX_RUNE + 1);
      e.transKeys.push(o), e.transVals.push(i);
    }
    return i;
  }
  match(e, t, n) {
    if ((n === V.ANCHOR_START || n === V.ANCHOR_BOTH) && t !== 0) return !1;
    if (!this.startState && (this.startState = this.getState([this.prog.start]), !this.startState))
      return null;
    let s = e.endPos(), i = this.startState;
    if (i.isMatch) if (n === V.ANCHOR_BOTH) {
      if (t === s) return !0;
    } else return !0;
    let o = t;
    for (; o < s; ) {
      const B = e.step(o), u = B >> 3, c = B & 7;
      if (c === 0) break;
      if (i = n === V.UNANCHORED && u <= K.MAX_LATIN1 && i.nextLatin1[u] || this.step(i, u, n), i === null) return null;
      if (i.lastSeen = ++this.clock, i.isMatch) if (n === V.ANCHOR_BOTH) {
        if (o + c === s) return !0;
      } else return !0;
      if (i.nfaStates.length === 0 && n !== V.UNANCHORED)
        return !1;
      o += c;
    }
    return !1;
  }
  matchSet(e, t, n) {
    if ((n === V.ANCHOR_START || n === V.ANCHOR_BOTH) && t !== 0) return [];
    if (!this.startState && (this.startState = this.getState([this.prog.start]), !this.startState))
      return null;
    let s = e.endPos(), i = this.startState;
    const o = /* @__PURE__ */ new Set(), B = (c, C) => {
      c.isMatch && (n === V.ANCHOR_BOTH ? C === s && c.matchIDs.forEach((f) => o.add(f)) : c.matchIDs.forEach((f) => o.add(f)));
    };
    B(i, t);
    let u = t;
    for (; u < s; ) {
      const c = e.step(u), C = c >> 3, f = c & 7;
      if (f === 0) break;
      if (i = n === V.UNANCHORED && C <= K.MAX_LATIN1 && i.nextLatin1[C] || this.step(i, C, n), i === null) return null;
      if (i.lastSeen = ++this.clock, u += f, B(i, u), i.nfaStates.length === 0 && n !== V.UNANCHORED)
        break;
    }
    return Array.from(o).sort((c, C) => c - C);
  }
}, M(Mt, "MAX_CACHE_CLEARS", 5), M(Mt, "STATE_MEMORY_ESTIMATE", 838), Mt);
const jE = 32, qE = 500, wa = 256, KE = 256 * 1024;
var zE = class {
  constructor() {
    this.end = 0, this.cap = /* @__PURE__ */ new Int32Array(0), this.matchcap = /* @__PURE__ */ new Int32Array(0), this.ncap = 0, this.jobPc = new Int32Array(wa), this.jobArg = new Uint8Array(wa), this.jobPos = new Int32Array(wa), this.jobLen = 0, this.visited = /* @__PURE__ */ new Uint32Array(0);
  }
  reset(r, e, t) {
    this.end = e, this.jobLen = 0, this.ncap = t;
    const n = r.numInst() * (e + 1) + jE - 1 >>> 5;
    this.visited.length < n ? this.visited = new Uint32Array(n) : this.visited.fill(0, 0, n), this.cap.length < t ? this.cap = new Int32Array(t).fill(-1) : this.cap.fill(-1, 0, t), this.matchcap.length < t ? this.matchcap = new Int32Array(t).fill(-1) : this.matchcap.fill(-1, 0, t);
  }
  shouldVisit(r, e) {
    const t = r * (this.end + 1) + e, n = t >>> 5, s = 1 << (t & 31);
    return (this.visited[n] & s) !== 0 ? !1 : (this.visited[n] |= s, !0);
  }
  push(r, e, t, n) {
    if (r.prog.getInst(e).op !== N.FAIL && (n || this.shouldVisit(e, t))) {
      if (this.jobLen >= this.jobPc.length) {
        const s = this.jobPc.length * 2, i = new Int32Array(s);
        i.set(this.jobPc), this.jobPc = i;
        const o = new Uint8Array(s);
        o.set(this.jobArg), this.jobArg = o;
        const B = new Int32Array(s);
        B.set(this.jobPos), this.jobPos = B;
      }
      this.jobPc[this.jobLen] = e, this.jobArg[this.jobLen] = n ? 1 : 0, this.jobPos[this.jobLen] = t, this.jobLen++;
    }
  }
  tryBacktrack(r, e, t, n, s) {
    const i = r.longest;
    for (this.push(r, t, n, !1); this.jobLen > 0; ) {
      this.jobLen--;
      let o = this.jobPc[this.jobLen], B = this.jobArg[this.jobLen] === 1, u = this.jobPos[this.jobLen], c = !0;
      for (; !(!c && !this.shouldVisit(o, u)); ) {
        c = !1;
        const C = r.prog.getInst(o);
        switch (C.op) {
          case N.FAIL:
            throw new gs("unexpected InstFail");
          case N.ALT:
            if (B) {
              B = !1, o = C.arg;
              continue;
            } else {
              this.push(r, o, u, !0), o = C.out;
              continue;
            }
          case N.ALT_MATCH: {
            const f = r.prog.getInst(C.out);
            if (N.isRuneOp(f.op)) {
              this.push(r, C.arg, u, !1), o = C.arg, u = this.end;
              continue;
            }
            this.push(r, C.out, this.end, !1), o = C.out;
            continue;
          }
          case N.RUNE: {
            const f = e.step(u);
            if (f === Ze.EOF() || !C.matchRune(f >> 3)) break;
            u += f & 7, o = C.out;
            continue;
          }
          case N.RUNE1: {
            const f = e.step(u);
            if (f === Ze.EOF() || f >> 3 !== C.runes[0]) break;
            u += f & 7, o = C.out;
            continue;
          }
          case N.RUNE_ANY_NOT_NL: {
            const f = e.step(u);
            if (f === Ze.EOF() || f >> 3 === 10) break;
            u += f & 7, o = C.out;
            continue;
          }
          case N.RUNE_ANY: {
            const f = e.step(u);
            if (f === Ze.EOF()) break;
            u += f & 7, o = C.out;
            continue;
          }
          case N.CAPTURE:
            if (B) {
              this.cap[C.arg] = u;
              break;
            } else {
              C.arg < this.ncap && (this.push(r, o, this.cap[C.arg], !0), this.cap[C.arg] = u), o = C.out;
              continue;
            }
          case N.EMPTY_WIDTH: {
            const f = e.context(u);
            if ((C.arg & ~f) !== 0) break;
            o = C.out;
            continue;
          }
          case N.NOP:
            o = C.out;
            continue;
          case N.MATCH: {
            if (s === V.ANCHOR_BOTH && u !== this.end) break;
            if (this.ncap === 0) return !0;
            this.ncap > 1 && (this.cap[1] = u);
            const f = this.matchcap[1];
            if ((f === -1 || i && u > 0 && u > f) && this.matchcap.set(this.cap), !i || u === this.end) return !0;
            break;
          }
          case N.LB_WRITE:
          case N.LB_CHECK:
            throw new gs("Backtracker cannot evaluate Lookbehind instructions");
          default:
            throw new gs("bad inst");
        }
        break;
      }
    }
    return i && this.matchcap.length > 1 && this.matchcap[1] >= 0;
  }
};
const Oi = [];
var bi = class gC {
  static shouldBacktrack(e) {
    return e.numInst() <= qE;
  }
  static maxBitStateLen(e) {
    return gC.shouldBacktrack(e) ? Math.floor(KE / e.numInst()) : 0;
  }
  static execute(e, t, n, s, i) {
    const o = e.cond;
    if (o === W.EMPTY_ALL || (s === V.ANCHOR_START || s === V.ANCHOR_BOTH) && n !== 0 || (o & W.EMPTY_BEGIN_TEXT) !== 0 && n !== 0) return null;
    const B = Oi.length > 0 ? Oi.pop() : new zE(), u = t.endPos();
    B.reset(e.prog, u, i);
    let c = !1;
    if ((o & W.EMPTY_BEGIN_TEXT) !== 0 || s === V.ANCHOR_START || s === V.ANCHOR_BOTH)
      B.ncap > 0 && (B.cap[0] = n), B.tryBacktrack(e, t, e.prog.start, n, s) && (c = !0);
    else {
      let f = -1;
      for (; n <= u && f !== 0; n += f) {
        if (e.prefix.length > 0) {
          const R = t.index(e, n);
          if (R < 0) break;
          n += R;
        }
        if (B.ncap > 0 && (B.cap[0] = n), B.tryBacktrack(e, t, e.prog.start, n, s)) {
          c = !0;
          break;
        }
        const m = t.step(n);
        f = m === Ze.EOF() ? 0 : m & 7;
      }
    }
    if (!c)
      return Oi.push(B), null;
    const C = i === 0 ? [] : W.toArray(B.matchcap.subarray(0, i));
    return Oi.push(B), C;
  }
}, Qc = class {
  constructor(r) {
    this.sparse = new Uint32Array(r), this.dense = new Uint32Array(r), this.size = 0, this.nextIndex = 0;
  }
  empty() {
    return this.nextIndex >= this.size;
  }
  next() {
    return this.dense[this.nextIndex++];
  }
  clear() {
    this.size = 0, this.nextIndex = 0;
  }
  contains(r) {
    return r < this.sparse.length && this.sparse[r] < this.size && this.dense[this.sparse[r]] === r;
  }
  insert(r) {
    this.contains(r) || this.insertNew(r);
  }
  insertNew(r) {
    r >= this.sparse.length || (this.sparse[r] = this.size, this.dense[this.size] = r, this.size++);
  }
};
const QE = (r, e, t, n) => {
  const s = r.length, i = e.length;
  let o = 0, B = 0;
  const u = [], c = [];
  let C = !0, f = -1;
  const m = (R) => {
    const P = R ? r : e, x = R ? o : B, H = R ? t : n;
    return f > 0 && P[x] <= u[f] ? !1 : (u.push(P[x], P[x + 1]), R ? o += 2 : B += 2, f += 2, c.push(H), !0);
  };
  for (; o < s || B < i; )
    if (B >= i ? C = m(!0) : o >= s || e[B] < r[o] ? C = m(!1) : C = m(!0), !C) return null;
  return {
    merged: u,
    next: c
  };
};
var WE = class {
  constructor(r) {
    this.start = r.start, this.numCap = r.numCap, this.inst = new Array(r.inst.length);
    for (let e = 0; e < r.inst.length; e++) {
      const t = r.inst[e], n = new N(t.op);
      n.out = t.out, n.arg = t.arg, n.runes = t.runes ? t.runes.slice() : [], n.next = null, this.inst[e] = n;
    }
  }
};
const $E = (r) => {
  const e = new WE(r);
  for (let t = 0; t < e.inst.length; t++) {
    const n = e.inst[t];
    if (n.op !== N.ALT && n.op !== N.ALT_MATCH) continue;
    let s = "out", i = "arg", o = e.inst[n[i]];
    if (o.op !== N.ALT && o.op !== N.ALT_MATCH && (s = "arg", i = "out", o = e.inst[n[i]], o.op !== N.ALT && o.op !== N.ALT_MATCH))
      continue;
    const B = e.inst[n[s]];
    if (B.op === N.ALT || B.op === N.ALT_MATCH) continue;
    let u = "out", c = "arg", C = !1;
    o.out === t ? C = !0 : o.arg === t && (C = !0, u = "arg", c = "out"), C && (o[u] = n[s]), n[s] === o[u] && (n[i] = o[c]);
  }
  return e;
}, YE = (r) => {
  if (r.inst.length >= 1e3) return null;
  const e = new Qc(r.inst.length), t = new Qc(r.inst.length), n = new Array(r.inst.length), s = new Array(r.inst.length).fill(!1), i = (o) => {
    let B = !0;
    const u = r.inst[o];
    if (t.contains(o)) return !0;
    switch (t.insert(o), u.op) {
      case N.ALT:
      case N.ALT_MATCH: {
        B = i(u.out) && i(u.arg);
        let c = s[u.out], C = s[u.arg];
        if (c && C) return !1;
        if (C) {
          const P = u.out;
          u.out = u.arg, u.arg = P;
          const x = c;
          c = C, C = x;
        }
        c && (s[o] = !0, u.op = N.ALT_MATCH);
        const f = n[u.out] || [], m = n[u.arg] || [], R = QE(f, m, u.out, u.arg);
        if (!R) return !1;
        n[o] = R.merged, u.next = new Uint32Array(R.next);
        break;
      }
      case N.CAPTURE:
      case N.EMPTY_WIDTH:
      case N.NOP:
        B = i(u.out), s[o] = s[u.out], n[o] = n[u.out] ? n[u.out].slice() : [], u.next = new Uint32Array(Math.floor(n[o].length / 2) + 1).fill(u.out);
        break;
      case N.MATCH:
      case N.FAIL:
        s[o] = u.op === N.MATCH;
        break;
      case N.RUNE: {
        if (s[o] = !1, u.next && u.next.length > 0) break;
        if (e.insert(u.out), !u.runes || u.runes.length === 0) {
          n[o] = [], u.next = new Uint32Array([u.out]);
          break;
        }
        let c = [];
        if (u.runes.length === 1 && (u.arg & V.FOLD_CASE) !== 0) {
          const C = u.runes[0];
          c.push(C, C);
          for (let f = K.simpleFold(C); f !== C; f = K.simpleFold(f)) c.push(f, f);
          c.sort((f, m) => f - m);
        } else for (let C = 0; C < u.runes.length; C++) c.push(u.runes[C]);
        n[o] = c, u.next = new Uint32Array(Math.floor(c.length / 2) + 1).fill(u.out), u.op = N.RUNE;
        break;
      }
      case N.RUNE1: {
        if (s[o] = !1, u.next && u.next.length > 0) break;
        e.insert(u.out);
        let c = [];
        if ((u.arg & V.FOLD_CASE) !== 0) {
          const C = u.runes[0];
          c.push(C, C);
          for (let f = K.simpleFold(C); f !== C; f = K.simpleFold(f)) c.push(f, f);
          c.sort((f, m) => f - m);
        } else c.push(u.runes[0], u.runes[0]);
        n[o] = c, u.next = new Uint32Array(Math.floor(c.length / 2) + 1).fill(u.out), u.op = N.RUNE;
        break;
      }
      case N.RUNE_ANY:
        if (s[o] = !1, u.next && u.next.length > 0) break;
        e.insert(u.out), n[o] = [0, K.MAX_RUNE], u.next = new Uint32Array([u.out]);
        break;
      case N.RUNE_ANY_NOT_NL:
        if (s[o] = !1, u.next && u.next.length > 0) break;
        e.insert(u.out), n[o] = [
          0,
          9,
          11,
          K.MAX_RUNE
        ], u.next = new Uint32Array(Math.floor(n[o].length / 2) + 1).fill(u.out);
        break;
    }
    return B;
  };
  for (e.clear(), e.insert(r.start); !e.empty(); )
    if (t.clear(), !i(e.next())) return null;
  for (let o = 0; o < r.inst.length; o++) n[o] && (r.inst[o].runes = n[o]);
  return r;
}, XE = (r, e) => {
  for (let t = 0; t < e.inst.length; t++) {
    const n = e.inst[t];
    switch (n.op) {
      case N.ALT:
      case N.ALT_MATCH:
      case N.RUNE:
        break;
      case N.CAPTURE:
      case N.EMPTY_WIDTH:
      case N.NOP:
      case N.MATCH:
      case N.FAIL:
        r.inst[t].next = null;
        break;
      case N.RUNE1:
      case N.RUNE_ANY:
      case N.RUNE_ANY_NOT_NL:
        r.inst[t].next = null, r.inst[t].op = n.op, r.inst[t].runes = n.runes ? n.runes.slice() : [];
        break;
    }
  }
};
var Wc = class mC {
  static compile(e) {
    if (e.start === 0 || e.numLb > 0) return null;
    const t = e.inst[e.start];
    if (t.op !== N.EMPTY_WIDTH || (t.arg & W.EMPTY_BEGIN_TEXT) === 0) return null;
    let n = !1;
    for (let i = 0; i < e.inst.length; i++) if (e.inst[i].op === N.ALT || e.inst[i].op === N.ALT_MATCH) {
      n = !0;
      break;
    }
    for (let i = 0; i < e.inst.length; i++) {
      const o = e.inst[i], B = e.inst[o.out].op;
      switch (o.op) {
        case N.ALT:
        case N.ALT_MATCH:
          if (B === N.MATCH || e.inst[o.arg].op === N.MATCH) return null;
          break;
        case N.EMPTY_WIDTH:
          if (B === N.MATCH) {
            if ((o.arg & W.EMPTY_END_TEXT) === W.EMPTY_END_TEXT) continue;
            return null;
          }
          break;
        default:
          if (B === N.MATCH && n) return null;
          break;
      }
    }
    let s = $E(e);
    return s = YE(s), s !== null && XE(s, e), s;
  }
  static next(e, t) {
    const n = e.matchRunePos(t);
    return n >= 0 ? e.next[n] : e.op === N.ALT_MATCH ? e.out : 0;
  }
  static execute(e, t, n, s, i) {
    const o = e.onepass;
    if (!o) return null;
    const B = new Int32Array(i).fill(-1);
    let u = !1, c = t.step(n), C = c >> 3, f = c & 7, m = Ze.EOF(), R = -1, P = 0;
    c !== Ze.EOF() && (m = t.step(n + f), m !== Ze.EOF() && (R = m >> 3, P = m & 7));
    let x = n === 0 ? W.emptyOpContext(-1, C) : t.context(n), H = o.start, z;
    for (; ; ) {
      switch (z = o.inst[H], H = z.out, z.op) {
        case N.MATCH:
          return s === V.ANCHOR_BOTH && n !== t.endPos() ? null : (u = !0, B.length > 0 && (B[0] = 0, B[1] = n), i === 0 ? [] : W.toArray(B));
        case N.RUNE:
          if (!z.matchRune(C)) return null;
          break;
        case N.RUNE1:
          if (C !== z.runes[0]) return null;
          break;
        case N.RUNE_ANY:
          break;
        case N.RUNE_ANY_NOT_NL:
          if (C === 10) return null;
          break;
        case N.ALT:
        case N.ALT_MATCH:
          H = mC.next(z, C);
          continue;
        case N.FAIL:
          return null;
        case N.NOP:
          continue;
        case N.EMPTY_WIDTH:
          if ((z.arg & ~x) !== 0) return null;
          continue;
        case N.CAPTURE:
          z.arg < B.length && (B[z.arg] = n);
          continue;
        default:
          throw new gs("bad inst");
      }
      if (f === 0) break;
      x = W.emptyOpContext(C, R), n += f, C = R, f = P, C !== -1 && (m = t.step(n + f), m !== Ze.EOF() ? (R = m >> 3, P = m & 7) : (R = -1, P = 0));
    }
    return u ? i === 0 ? [] : W.toArray(B) : null;
  }
}, X, w = (X = class {
  static isPseudoOp(e) {
    return e >= X.Op.LEFT_PAREN;
  }
  static emptySubs() {
    return [];
  }
  static quoteIfHyphen(e) {
    return e === b.CODES.get("-") ? "\\" : "";
  }
  static fromRegexp(e) {
    const t = new X(e.op);
    return t.flags = e.flags, t.subs = e.subs, t.runes = e.runes, t.cap = e.cap, t.min = e.min, t.max = e.max, t.name = e.name, t.namedGroups = e.namedGroups, t.lb = e.lb, t;
  }
  constructor(e) {
    this.op = e, this.flags = 0, this.subs = X.emptySubs(), this.runes = [], this.min = 0, this.max = 0, this.cap = 0, this.name = null, this.namedGroups = /* @__PURE__ */ Object.create(null), this.lb = 0;
  }
  reinit() {
    this.flags = 0, this.subs = X.emptySubs(), this.runes = [], this.cap = 0, this.min = 0, this.max = 0, this.name = null, this.namedGroups = /* @__PURE__ */ Object.create(null), this.lb = 0;
  }
  toString() {
    return this.appendTo();
  }
  appendTo() {
    let e = "";
    switch (this.op) {
      case X.Op.NO_MATCH:
        e += "[^\\x00-\\x{10FFFF}]";
        break;
      case X.Op.EMPTY_MATCH:
        e += "(?:)";
        break;
      case X.Op.STAR:
      case X.Op.PLUS:
      case X.Op.QUEST:
      case X.Op.REPEAT: {
        const t = this.subs[0];
        switch (t.op > X.Op.CAPTURE || t.op === X.Op.LITERAL && t.runes.length > 1 ? e += `(?:${t.appendTo()})` : e += t.appendTo(), this.op) {
          case X.Op.STAR:
            e += "*";
            break;
          case X.Op.PLUS:
            e += "+";
            break;
          case X.Op.QUEST:
            e += "?";
            break;
          case X.Op.REPEAT:
            e += `{${this.min}`, this.min !== this.max && (e += ",", this.max >= 0 && (e += this.max)), e += "}";
            break;
        }
        (this.flags & V.NON_GREEDY) !== 0 && (e += "?");
        break;
      }
      case X.Op.CONCAT:
        for (let t of this.subs) t.op === X.Op.ALTERNATE ? e += `(?:${t.appendTo()})` : e += t.appendTo();
        break;
      case X.Op.ALTERNATE: {
        let t = "";
        for (let n of this.subs)
          e += t, t = "|", e += n.appendTo();
        break;
      }
      case X.Op.LITERAL:
        (this.flags & V.FOLD_CASE) !== 0 && (e += "(?i:");
        for (let t of this.runes) e += W.escapeRune(t);
        (this.flags & V.FOLD_CASE) !== 0 && (e += ")");
        break;
      case X.Op.ANY_CHAR_NOT_NL:
        e += "(?-s:.)";
        break;
      case X.Op.ANY_CHAR:
        e += "(?s:.)";
        break;
      case X.Op.PLB:
        e += `(?<=${this.subs[0].appendTo()})`;
        break;
      case X.Op.NLB:
        e += `(?<!${this.subs[0].appendTo()})`;
        break;
      case X.Op.CAPTURE:
        this.name === null || this.name.length === 0 ? e += "(" : e += `(?P<${this.name}>`, this.subs[0].op !== X.Op.EMPTY_MATCH && (e += this.subs[0].appendTo()), e += ")";
        break;
      case X.Op.BEGIN_TEXT:
        e += "\\A";
        break;
      case X.Op.END_TEXT:
        (this.flags & V.WAS_DOLLAR) !== 0 ? e += "(?-m:$)" : e += "\\z";
        break;
      case X.Op.BEGIN_LINE:
        e += "^";
        break;
      case X.Op.END_LINE:
        e += "$";
        break;
      case X.Op.WORD_BOUNDARY:
        e += "\\b";
        break;
      case X.Op.NO_WORD_BOUNDARY:
        e += "\\B";
        break;
      case X.Op.CHAR_CLASS:
        if (this.runes.length % 2 !== 0) {
          e += "[invalid char class]";
          break;
        }
        if (e += "[", this.runes.length === 0) e += "^\\x00-\\x{10FFFF}";
        else if (this.runes[0] === 0 && this.runes[this.runes.length - 1] === K.MAX_RUNE) {
          e += "^";
          for (let t = 1; t < this.runes.length - 1; t += 2) {
            const n = this.runes[t] + 1, s = this.runes[t + 1] - 1;
            e += X.quoteIfHyphen(n), e += W.escapeRune(n), n !== s && (e += "-", e += X.quoteIfHyphen(s), e += W.escapeRune(s));
          }
        } else for (let t = 0; t < this.runes.length; t += 2) {
          const n = this.runes[t], s = this.runes[t + 1];
          e += X.quoteIfHyphen(n), e += W.escapeRune(n), n !== s && (e += "-", e += X.quoteIfHyphen(s), e += W.escapeRune(s));
        }
        e += "]";
        break;
      default:
        e += this.op;
        break;
    }
    return e;
  }
  maxCap() {
    let e = 0;
    if (this.op === X.Op.CAPTURE && (e = this.cap), this.subs !== null) for (let t of this.subs) {
      const n = t.maxCap();
      e < n && (e = n);
    }
    return e;
  }
  equals(e) {
    if (!(e !== null && e instanceof X) || this.op !== e.op) return !1;
    switch (this.op) {
      case X.Op.END_TEXT:
        if ((this.flags & V.WAS_DOLLAR) !== (e.flags & V.WAS_DOLLAR)) return !1;
        break;
      case X.Op.LITERAL:
      case X.Op.CHAR_CLASS:
        if (this.runes === null && e.runes === null) break;
        if (this.runes === null || e.runes === null || this.runes.length !== e.runes.length) return !1;
        for (let t = 0; t < this.runes.length; t++) if (this.runes[t] !== e.runes[t]) return !1;
        break;
      case X.Op.ALTERNATE:
      case X.Op.CONCAT:
        if (this.subs.length !== e.subs.length) return !1;
        for (let t = 0; t < this.subs.length; ++t) if (!this.subs[t].equals(e.subs[t])) return !1;
        break;
      case X.Op.STAR:
      case X.Op.PLUS:
      case X.Op.QUEST:
        if ((this.flags & V.NON_GREEDY) !== (e.flags & V.NON_GREEDY) || !this.subs[0].equals(e.subs[0])) return !1;
        break;
      case X.Op.REPEAT:
        if ((this.flags & V.NON_GREEDY) !== (e.flags & V.NON_GREEDY) || this.min !== e.min || this.max !== e.max || !this.subs[0].equals(e.subs[0])) return !1;
        break;
      case X.Op.CAPTURE:
        if (this.cap !== e.cap || (this.name === null ? e.name !== null : this.name !== e.name) || !this.subs[0].equals(e.subs[0])) return !1;
        break;
      case X.Op.PLB:
      case X.Op.NLB:
        if (this.lb !== e.lb || !this.subs[0].equals(e.subs[0])) return !1;
        break;
    }
    return !0;
  }
}, M(X, "Op", pC([
  "NO_MATCH",
  "EMPTY_MATCH",
  "LITERAL",
  "CHAR_CLASS",
  "ANY_CHAR_NOT_NL",
  "ANY_CHAR",
  "BEGIN_LINE",
  "END_LINE",
  "BEGIN_TEXT",
  "END_TEXT",
  "WORD_BOUNDARY",
  "NO_WORD_BOUNDARY",
  "CAPTURE",
  "STAR",
  "PLUS",
  "QUEST",
  "REPEAT",
  "CONCAT",
  "ALTERNATE",
  "PLB",
  "NLB",
  "LEFT_PAREN",
  "VERTICAL_BAR"
])), X), $c = class {
  constructor(r) {
    this.next = [/* @__PURE__ */ Object.create(null)], this.fail = [0], this.match = [!1];
    for (const t of r) {
      let n = 0;
      for (let s = 0; s < t.length; s++) {
        const i = t[s];
        i in this.next[n] || (this.next.push(/* @__PURE__ */ Object.create(null)), this.fail.push(0), this.match.push(!1), this.next[n][i] = this.next.length - 1), n = this.next[n][i];
      }
      this.match[n] = !0;
    }
    const e = [];
    for (const t in this.next[0]) if (Object.prototype.hasOwnProperty.call(this.next[0], t)) {
      const n = this.next[0][t];
      this.fail[n] = 0, e.push(n);
    }
    for (; e.length > 0; ) {
      const t = e.shift();
      for (const n in this.next[t]) if (Object.prototype.hasOwnProperty.call(this.next[t], n)) {
        const s = this.next[t][n];
        let i = this.fail[t];
        for (; i !== 0 && !(n in this.next[i]); ) i = this.fail[i];
        n in this.next[i] ? this.fail[s] = this.next[i][n] : this.fail[s] = 0, this.match[s] = this.match[s] || this.match[this.fail[s]], e.push(s);
      }
    }
  }
  searchUTF16(r, e, t) {
    let n = 0;
    for (let s = e; s < t; s++) {
      const i = r.charCodeAt(s);
      for (; n !== 0 && !(i in this.next[n]); ) n = this.fail[n];
      if (i in this.next[n] && (n = this.next[n][i]), this.match[n]) return !0;
    }
    return !1;
  }
  searchUTF8(r, e, t) {
    let n = 0;
    for (let s = e; s < t; s++) {
      const i = r[s];
      for (; n !== 0 && !(i in this.next[n]); ) n = this.fail[n];
      if (i in this.next[n] && (n = this.next[n][i]), this.match[n]) return !0;
    }
    return !1;
  }
}, Ot, le = (Ot = class {
  constructor(e) {
    this.type = e, this.subs = [], this.str = "", this.bytes = null, this.ac16 = null, this.ac8 = null;
  }
  eval(e, t) {
    switch (this.type) {
      case Ot.Type.NONE:
        return !0;
      case Ot.Type.EXACT:
        return e.hasString(this, t);
      case Ot.Type.AND:
        for (let n = 0; n < this.subs.length; n++) if (!this.subs[n].eval(e, t)) return !1;
        return !0;
      case Ot.Type.OR:
        if (this.ac16 && this.ac8) return e.hasAnyString(this, t);
        for (let n = 0; n < this.subs.length; n++) if (this.subs[n].eval(e, t)) return !0;
        return !1;
      default:
        return !0;
    }
  }
}, M(Ot, "Type", {
  NONE: 0,
  EXACT: 1,
  AND: 2,
  OR: 3
}), Ot), ZE = class xt {
  static build(e) {
    const t = xt.fromRegexp(e);
    return xt.simplify(t);
  }
  static fromRegexp(e) {
    if (!e) return new le(le.Type.NONE);
    switch (e.op) {
      case w.Op.PLB:
      case w.Op.NLB:
      case w.Op.NO_MATCH:
      case w.Op.EMPTY_MATCH:
      case w.Op.BEGIN_LINE:
      case w.Op.END_LINE:
      case w.Op.BEGIN_TEXT:
      case w.Op.END_TEXT:
      case w.Op.WORD_BOUNDARY:
      case w.Op.NO_WORD_BOUNDARY:
      case w.Op.CHAR_CLASS:
      case w.Op.ANY_CHAR_NOT_NL:
      case w.Op.ANY_CHAR:
        return new le(le.Type.NONE);
      case w.Op.LITERAL: {
        if (e.runes.length === 0 || (e.flags & V.FOLD_CASE) !== 0) return new le(le.Type.NONE);
        const t = new le(le.Type.EXACT);
        let n = "";
        for (let s = 0; s < e.runes.length; s++) n += String.fromCodePoint(e.runes[s]);
        return t.str = n, t.bytes = W.stringToUtf8ByteArray(t.str), t;
      }
      case w.Op.CAPTURE:
      case w.Op.PLUS:
        return xt.fromRegexp(e.subs[0]);
      case w.Op.REPEAT:
        return e.min >= 1 ? xt.fromRegexp(e.subs[0]) : new le(le.Type.NONE);
      case w.Op.CONCAT: {
        const t = new le(le.Type.AND);
        for (const n of e.subs) t.subs.push(xt.fromRegexp(n));
        return t;
      }
      case w.Op.ALTERNATE: {
        const t = new le(le.Type.OR);
        for (const n of e.subs) t.subs.push(xt.fromRegexp(n));
        return t;
      }
      default:
        return new le(le.Type.NONE);
    }
  }
  static simplify(e) {
    if (e.type === le.Type.EXACT || e.type === le.Type.NONE) return e;
    if (e.type === le.Type.AND) {
      const t = [];
      for (const n of e.subs) {
        const s = xt.simplify(n);
        if (s.type !== le.Type.NONE) if (s.type === le.Type.AND) for (let i = 0; i < s.subs.length; i++) t.push(s.subs[i]);
        else t.push(s);
      }
      return t.length === 0 ? new le(le.Type.NONE) : t.length === 1 ? t[0] : (e.subs = t, e);
    }
    if (e.type === le.Type.OR) {
      const t = [];
      for (const o of e.subs) {
        const B = xt.simplify(o);
        if (B.type === le.Type.NONE) return new le(le.Type.NONE);
        if (B.type === le.Type.OR) for (let u = 0; u < B.subs.length; u++) t.push(B.subs[u]);
        else t.push(B);
      }
      if (t.length === 0) return new le(le.Type.NONE);
      if (t.length === 1) return t[0];
      const n = /* @__PURE__ */ new Set(), s = [];
      for (const o of t) o.type === le.Type.EXACT ? n.has(o.str) || (n.add(o.str), s.push(o)) : s.push(o);
      e.subs = s;
      let i = !0;
      for (const o of s) if (o.type !== le.Type.EXACT) {
        i = !1;
        break;
      }
      return i && s.length > 1 && (e.ac16 = new $c(s.map((o) => {
        const B = [];
        for (let u = 0; u < o.str.length; u++) B.push(o.str.charCodeAt(u));
        return B;
      })), e.ac8 = new $c(s.map((o) => o.bytes))), e;
    }
    return e;
  }
}, _t = class {
  /**
  * @param {number} head - Encoded pointer to the start of the patch list.
  * @param {number} tail - Encoded pointer to the end of the patch list.
  */
  constructor(r = 0, e = 0) {
    this.head = r, this.tail = e;
  }
}, e_ = class {
  constructor() {
    this.inst = [], this.start = 0, this.numCap = 2, this.lbStarts = [], this.numLb = 0;
  }
  getInst(r) {
    return this.inst[r];
  }
  numInst() {
    return this.inst.length;
  }
  addInst(r) {
    this.inst.push(new N(r));
  }
  skipNop(r) {
    let e = this.inst[r];
    for (; e.op === N.NOP || e.op === N.CAPTURE; )
      e = this.inst[r], r = e.out;
    return e;
  }
  prefix() {
    let r = "", e = this.skipNop(this.start);
    if (!N.isRuneOp(e.op) || e.runes.length !== 1) return [e.op === N.MATCH, r];
    for (; N.isRuneOp(e.op) && e.runes.length === 1 && (e.arg & V.FOLD_CASE) === 0; )
      r += String.fromCodePoint(e.runes[0]), e = this.skipNop(e.out);
    return [e.op === N.MATCH, r];
  }
  startCond() {
    let r = 0, e = this.start;
    e: for (; ; ) {
      const t = this.inst[e];
      switch (t.op) {
        case N.EMPTY_WIDTH:
          r |= t.arg;
          break;
        case N.FAIL:
          return -1;
        case N.CAPTURE:
        case N.NOP:
          break;
        default:
          break e;
      }
      e = t.out;
    }
    return r;
  }
  patch(r, e) {
    let t = r.head;
    for (; t !== 0; ) {
      const n = this.inst[t >> 1];
      (t & 1) === 0 ? (t = n.out, n.out = e) : (t = n.arg, n.arg = e);
    }
  }
  append(r, e) {
    if (r.head === 0) return e;
    if (e.head === 0) return r;
    const t = this.inst[r.tail >> 1];
    return (r.tail & 1) === 0 ? t.out = e.head : t.arg = e.head, new _t(r.head, e.tail);
  }
  /**
  *
  * @returns {string}
  */
  toString() {
    let r = "";
    for (let e = 0; e < this.inst.length; e++) {
      const t = r.length;
      r += e, e === this.start && (r += "*"), r += "        ".substring(r.length - t), r += this.inst[e], r += `
`;
    }
    return r;
  }
}, Ni = class {
  constructor(r = 0, e = new _t(), t = !1) {
    this.i = r, this.out = e, this.nullable = t;
  }
}, t_ = class lr {
  static ANY_RUNE_NOT_NL() {
    return [
      0,
      b.CODES.get(`
`) - 1,
      b.CODES.get(`
`) + 1,
      K.MAX_RUNE
    ];
  }
  static ANY_RUNE() {
    return [0, K.MAX_RUNE];
  }
  static compileRegexp(e) {
    const t = new lr(), n = t.compile(e);
    return t.prog.patch(n.out, t.newInst(N.MATCH).i), t.prog.start = n.i, t.prog;
  }
  static compileSet(e) {
    const t = new lr();
    if (e.length === 0)
      return t.prog.start = t.newInst(N.FAIL).i, t.prog;
    let n = [];
    for (let i = 0; i < e.length; i++) {
      const o = t.compile(e[i]), B = t.newInst(N.MATCH);
      t.prog.getInst(B.i).arg = i, t.prog.patch(o.out, B.i), n.push(o.i);
    }
    let s = n[0];
    for (let i = 1; i < n.length; i++) {
      const o = t.newInst(N.ALT), B = t.prog.getInst(o.i);
      B.out = s, B.arg = n[i], s = o.i;
    }
    return t.prog.start = s, t.prog;
  }
  constructor() {
    this.prog = new e_(), this.newInst(N.FAIL);
  }
  newInst(e) {
    return this.prog.addInst(e), new Ni(this.prog.numInst() - 1, new _t(), !0);
  }
  nop() {
    const e = this.newInst(N.NOP);
    return e.out = new _t(e.i << 1, e.i << 1), e;
  }
  fail() {
    return new Ni();
  }
  cap(e) {
    const t = this.newInst(N.CAPTURE);
    return t.out = new _t(t.i << 1, t.i << 1), this.prog.getInst(t.i).arg = e, this.prog.numCap < e + 1 && (this.prog.numCap = e + 1), t;
  }
  cat(e, t) {
    return e.i === 0 || t.i === 0 ? this.fail() : (this.prog.patch(e.out, t.i), new Ni(e.i, t.out, e.nullable && t.nullable));
  }
  alt(e, t) {
    if (e.i === 0) return t;
    if (t.i === 0) return e;
    const n = this.newInst(N.ALT), s = this.prog.getInst(n.i);
    return s.out = e.i, s.arg = t.i, n.out = this.prog.append(e.out, t.out), n.nullable = e.nullable || t.nullable, n;
  }
  loop(e, t) {
    const n = this.newInst(N.ALT), s = this.prog.getInst(n.i);
    return t ? (s.arg = e.i, n.out = new _t(n.i << 1, n.i << 1)) : (s.out = e.i, n.out = new _t(n.i << 1 | 1, n.i << 1 | 1)), this.prog.patch(e.out, n.i), n;
  }
  quest(e, t) {
    const n = this.newInst(N.ALT), s = this.prog.getInst(n.i);
    return t ? (s.arg = e.i, n.out = new _t(n.i << 1, n.i << 1)) : (s.out = e.i, n.out = new _t(n.i << 1 | 1, n.i << 1 | 1)), n.out = this.prog.append(n.out, e.out), n;
  }
  star(e, t) {
    return e.nullable ? this.quest(this.plus(e, t), t) : this.loop(e, t);
  }
  plus(e, t) {
    return new Ni(e.i, this.loop(e, t).out, e.nullable);
  }
  empty(e) {
    const t = this.newInst(N.EMPTY_WIDTH);
    return this.prog.getInst(t.i).arg = e, t.out = new _t(t.i << 1, t.i << 1), t;
  }
  rune(e, t) {
    const n = this.newInst(N.RUNE);
    n.nullable = !1;
    const s = this.prog.getInst(n.i);
    return s.runes = e, t &= V.FOLD_CASE, (e.length !== 1 || K.simpleFold(e[0]) === e[0]) && (t &= -2), s.arg = t, n.out = new _t(n.i << 1, n.i << 1), (t & V.FOLD_CASE) === 0 && e.length === 1 || e.length === 2 && e[0] === e[1] ? s.op = N.RUNE1 : e.length === 2 && e[0] === 0 && e[1] === K.MAX_RUNE ? s.op = N.RUNE_ANY : e.length === 4 && e[0] === 0 && e[1] === b.CODES.get(`
`) - 1 && e[2] === b.CODES.get(`
`) + 1 && e[3] === K.MAX_RUNE && (s.op = N.RUNE_ANY_NOT_NL), n;
  }
  lookBehind(e, t) {
    const n = this.newInst(N.LB_WRITE);
    this.prog.getInst(n.i).arg = t;
    const s = this.rune(lr.ANY_RUNE(), 0), i = this.star(s, !0), o = this.cat(i, e);
    this.prog.patch(o.out, n.i);
    const B = this.newInst(N.LB_CHECK);
    return this.prog.getInst(B.i).arg = t, this.prog.lbStarts.push(o.i), Math.abs(t) > this.prog.numLb && (this.prog.numLb = Math.abs(t)), B.out = new _t(B.i << 1, B.i << 1), B;
  }
  compile(e) {
    switch (e.op) {
      case w.Op.NO_MATCH:
        return this.fail();
      case w.Op.EMPTY_MATCH:
        return this.nop();
      case w.Op.LITERAL:
        if (e.runes.length === 0) return this.nop();
        {
          let t = null;
          for (let n of e.runes) {
            const s = this.rune([n], e.flags);
            t = t === null ? s : this.cat(t, s);
          }
          return t;
        }
      case w.Op.CHAR_CLASS:
        return this.rune(e.runes, e.flags);
      case w.Op.ANY_CHAR_NOT_NL:
        return this.rune(lr.ANY_RUNE_NOT_NL(), 0);
      case w.Op.ANY_CHAR:
        return this.rune(lr.ANY_RUNE(), 0);
      case w.Op.BEGIN_LINE:
        return this.empty(W.EMPTY_BEGIN_LINE);
      case w.Op.END_LINE:
        return this.empty(W.EMPTY_END_LINE);
      case w.Op.BEGIN_TEXT:
        return this.empty(W.EMPTY_BEGIN_TEXT);
      case w.Op.END_TEXT:
        return this.empty(W.EMPTY_END_TEXT);
      case w.Op.WORD_BOUNDARY:
        return this.empty(W.EMPTY_WORD_BOUNDARY);
      case w.Op.NO_WORD_BOUNDARY:
        return this.empty(W.EMPTY_NO_WORD_BOUNDARY);
      case w.Op.PLB:
      case w.Op.NLB:
        return this.lookBehind(this.compile(e.subs[0]), e.lb);
      case w.Op.CAPTURE: {
        const t = this.cap(e.cap << 1), n = this.compile(e.subs[0]), s = this.cap(e.cap << 1 | 1);
        return this.cat(this.cat(t, n), s);
      }
      case w.Op.STAR:
        return this.star(this.compile(e.subs[0]), (e.flags & V.NON_GREEDY) !== 0);
      case w.Op.PLUS:
        return this.plus(this.compile(e.subs[0]), (e.flags & V.NON_GREEDY) !== 0);
      case w.Op.QUEST:
        return this.quest(this.compile(e.subs[0]), (e.flags & V.NON_GREEDY) !== 0);
      case w.Op.CONCAT:
        if (e.subs.length === 0) return this.nop();
        {
          let t = null;
          for (let n of e.subs) {
            const s = this.compile(n);
            t = t === null ? s : this.cat(t, s);
          }
          return t;
        }
      case w.Op.ALTERNATE:
        if (e.subs.length === 0) return this.nop();
        {
          let t = null;
          for (let n of e.subs) {
            const s = this.compile(n);
            t = t === null ? s : this.alt(t, s);
          }
          return t;
        }
      default:
        throw new xE("regexp: unhandled case in compile");
    }
  }
}, n_ = class ht {
  static simplify(e) {
    if (e === null) return null;
    switch (e.op) {
      case w.Op.PLB:
      case w.Op.NLB:
      case w.Op.CAPTURE: {
        const t = ht.simplify(e.subs[0]);
        if (t !== e.subs[0]) {
          const n = w.fromRegexp(e);
          return n.runes = [], n.subs = [t], n;
        }
        return e;
      }
      case w.Op.CONCAT:
      case w.Op.ALTERNATE: {
        const t = [];
        let n = !1;
        for (let s = 0; s < e.subs.length; s++) {
          const i = e.subs[s], o = ht.simplify(i);
          if (o !== i && (n = !0), e.op === w.Op.CONCAT) {
            if (o.op === w.Op.NO_MATCH) return new w(w.Op.NO_MATCH);
            if (o.op === w.Op.EMPTY_MATCH) {
              n = !0;
              continue;
            }
            if (o.op === w.Op.CONCAT) {
              n = !0;
              for (let B = 0; B < o.subs.length; B++) t.push(o.subs[B]);
              continue;
            }
          } else if (e.op === w.Op.ALTERNATE) {
            if (o.op === w.Op.NO_MATCH) {
              n = !0;
              continue;
            }
            if (o.op === w.Op.ALTERNATE) {
              n = !0;
              for (let B = 0; B < o.subs.length; B++) t.push(o.subs[B]);
              continue;
            }
          }
          t.push(o);
        }
        if (n) {
          if (t.length === 0) return new w(e.op === w.Op.CONCAT ? w.Op.EMPTY_MATCH : w.Op.NO_MATCH);
          if (t.length === 1) return t[0];
          const s = w.fromRegexp(e);
          return s.runes = [], s.subs = t, s;
        }
        return e;
      }
      case w.Op.CHAR_CLASS:
        return e.runes === null ? e : e.runes.length === 0 ? new w(w.Op.NO_MATCH) : e.runes.length === 2 && e.runes[0] === 0 && e.runes[1] === K.MAX_RUNE ? new w(w.Op.ANY_CHAR) : e.runes.length === 4 && e.runes[0] === 0 && e.runes[1] === b.CODES.get(`
`) - 1 && e.runes[2] === b.CODES.get(`
`) + 1 && e.runes[3] === K.MAX_RUNE ? new w(w.Op.ANY_CHAR_NOT_NL) : e;
      case w.Op.STAR:
      case w.Op.PLUS:
      case w.Op.QUEST: {
        const t = ht.simplify(e.subs[0]);
        return ht.simplify1(e.op, e.flags, t, e);
      }
      case w.Op.REPEAT: {
        if (e.min === 0 && e.max === 0) return new w(w.Op.EMPTY_MATCH);
        const t = ht.simplify(e.subs[0]);
        if (e.max === -1) {
          if (e.min === 0) return ht.simplify1(w.Op.STAR, e.flags, t, null);
          if (e.min === 1) return ht.simplify1(w.Op.PLUS, e.flags, t, null);
          const s = new w(w.Op.CONCAT), i = [];
          for (let o = 0; o < e.min - 1; o++) i.push(t);
          return i.push(ht.simplify1(w.Op.PLUS, e.flags, t, null)), s.subs = i.slice(0), ht.simplify(s);
        }
        if (e.min === 1 && e.max === 1) return t;
        let n = null;
        if (e.min > 0) {
          n = [];
          for (let s = 0; s < e.min; s++) n.push(t);
        }
        if (e.max > e.min) {
          let s = ht.simplify1(w.Op.QUEST, e.flags, t, null);
          for (let i = e.min + 1; i < e.max; i++) {
            const o = new w(w.Op.CONCAT);
            o.subs = [t, s], s = ht.simplify1(w.Op.QUEST, e.flags, o, null);
          }
          if (n === null) return s;
          n.push(s);
        }
        if (n !== null) {
          const s = new w(w.Op.CONCAT);
          return s.subs = n.slice(0), ht.simplify(s);
        }
        return new w(w.Op.NO_MATCH);
      }
    }
    return e;
  }
  static simplify1(e, t, n, s) {
    if (n.op === w.Op.EMPTY_MATCH) return n;
    if (n.op === w.Op.NO_MATCH)
      return e === w.Op.PLUS ? n : new w(w.Op.EMPTY_MATCH);
    if (e === n.op && (t & V.NON_GREEDY) === (n.flags & V.NON_GREEDY)) return n;
    if (s !== null && s.op === e && (s.flags & V.NON_GREEDY) === (t & V.NON_GREEDY) && n === s.subs[0]) return s;
    const i = new w(e);
    return i.flags = t, i.subs = [n], i;
  }
}, ce = class {
  constructor(r, e) {
    this.sign = r, this.cls = e;
  }
};
const Yc = [48, 57], Xc = [
  9,
  10,
  12,
  13,
  32,
  32
], Zc = [
  48,
  57,
  65,
  90,
  95,
  95,
  97,
  122
], el = /* @__PURE__ */ new Map([
  ["\\d", new ce(1, Yc)],
  ["\\D", new ce(-1, Yc)],
  ["\\s", new ce(1, Xc)],
  ["\\S", new ce(-1, Xc)],
  ["\\w", new ce(1, Zc)],
  ["\\W", new ce(-1, Zc)]
]), tl = [
  48,
  57,
  65,
  90,
  97,
  122
], nl = [
  65,
  90,
  97,
  122
], rl = [0, 127], sl = [
  9,
  9,
  32,
  32
], il = [
  0,
  31,
  127,
  127
], ol = [48, 57], al = [33, 126], Bl = [97, 122], ul = [32, 126], cl = [
  33,
  47,
  58,
  64,
  91,
  96,
  123,
  126
], ll = [
  9,
  13,
  32,
  32
], hl = [65, 90], Cl = [
  48,
  57,
  65,
  90,
  95,
  95,
  97,
  122
], fl = [
  48,
  57,
  65,
  70,
  97,
  102
], dl = /* @__PURE__ */ new Map([
  ["[:alnum:]", new ce(1, tl)],
  ["[:^alnum:]", new ce(-1, tl)],
  ["[:alpha:]", new ce(1, nl)],
  ["[:^alpha:]", new ce(-1, nl)],
  ["[:ascii:]", new ce(1, rl)],
  ["[:^ascii:]", new ce(-1, rl)],
  ["[:blank:]", new ce(1, sl)],
  ["[:^blank:]", new ce(-1, sl)],
  ["[:cntrl:]", new ce(1, il)],
  ["[:^cntrl:]", new ce(-1, il)],
  ["[:digit:]", new ce(1, ol)],
  ["[:^digit:]", new ce(-1, ol)],
  ["[:graph:]", new ce(1, al)],
  ["[:^graph:]", new ce(-1, al)],
  ["[:lower:]", new ce(1, Bl)],
  ["[:^lower:]", new ce(-1, Bl)],
  ["[:print:]", new ce(1, ul)],
  ["[:^print:]", new ce(-1, ul)],
  ["[:punct:]", new ce(1, cl)],
  ["[:^punct:]", new ce(-1, cl)],
  ["[:space:]", new ce(1, ll)],
  ["[:^space:]", new ce(-1, ll)],
  ["[:upper:]", new ce(1, hl)],
  ["[:^upper:]", new ce(-1, hl)],
  ["[:word:]", new ce(1, Cl)],
  ["[:^word:]", new ce(-1, Cl)],
  ["[:xdigit:]", new ce(1, fl)],
  ["[:^xdigit:]", new ce(-1, fl)]
]);
var sn = class an {
  static charClassToString(e, t) {
    let n = "[";
    for (let s = 0; s < t; s += 2) {
      s > 0 && (n += " ");
      const i = e[s], o = e[s + 1];
      i === o ? n += `0x${i.toString(16)}` : n += `0x${i.toString(16)}-0x${o.toString(16)}`;
    }
    return n += "]", n;
  }
  static cmp(e, t, n, s) {
    const i = e[t] - n;
    return i !== 0 ? i : s - e[t + 1];
  }
  static qsortIntPair(e, t, n) {
    const s = ((t + n) / 2 | 0) & -2, i = e[s], o = e[s + 1];
    let B = t, u = n;
    for (; B <= u; ) {
      for (; B < n && an.cmp(e, B, i, o) < 0; ) B += 2;
      for (; u > t && an.cmp(e, u, i, o) > 0; ) u -= 2;
      if (B <= u) {
        if (B !== u) {
          let c = e[B];
          e[B] = e[u], e[u] = c, c = e[B + 1], e[B + 1] = e[u + 1], e[u + 1] = c;
        }
        B += 2, u -= 2;
      }
    }
    t < u && an.qsortIntPair(e, t, u), B < n && an.qsortIntPair(e, B, n);
  }
  constructor(e = W.emptyInts()) {
    this.r = e, this.len = e.length;
  }
  toArray() {
    return this.len === this.r.length ? this.r : this.r.slice(0, this.len);
  }
  cleanClass() {
    if (this.len < 4) return this;
    an.qsortIntPair(this.r, 0, this.len - 2);
    let e = 2;
    for (let t = 2; t < this.len; t += 2) {
      const n = this.r[t], s = this.r[t + 1];
      if (n <= this.r[e - 1] + 1) {
        s > this.r[e - 1] && (this.r[e - 1] = s);
        continue;
      }
      this.r[e] = n, this.r[e + 1] = s, e += 2;
    }
    return this.len = e, this;
  }
  appendLiteral(e, t) {
    return (t & V.FOLD_CASE) !== 0 ? this.appendFoldedRange(e, e) : this.appendRange(e, e);
  }
  appendRange(e, t) {
    if (this.len > 0) {
      for (let n = 2; n <= 4; n += 2) if (this.len >= n) {
        const s = this.r[this.len - n], i = this.r[this.len - n + 1];
        if (e <= i + 1 && s <= t + 1)
          return e < s && (this.r[this.len - n] = e), t > i && (this.r[this.len - n + 1] = t), this;
      }
    }
    return this.r[this.len++] = e, this.r[this.len++] = t, this;
  }
  appendFoldedRange(e, t) {
    if (e <= K.MIN_FOLD && t >= K.MAX_FOLD) return this.appendRange(e, t);
    if (t < K.MIN_FOLD || e > K.MAX_FOLD) return this.appendRange(e, t);
    e < K.MIN_FOLD && (this.appendRange(e, K.MIN_FOLD - 1), e = K.MIN_FOLD), t > K.MAX_FOLD && (this.appendRange(K.MAX_FOLD + 1, t), t = K.MAX_FOLD);
    for (let n = e; n <= t; n++) {
      this.appendRange(n, n);
      for (let s = K.simpleFold(n); s !== n; s = K.simpleFold(s)) this.appendRange(s, s);
    }
    return this;
  }
  appendClass(e) {
    for (let t = 0; t < e.length; t += 2) this.appendRange(e[t], e[t + 1]);
    return this;
  }
  appendFoldedClass(e) {
    for (let t = 0; t < e.length; t += 2) this.appendFoldedRange(e[t], e[t + 1]);
    return this;
  }
  appendNegatedClass(e) {
    let t = 0;
    for (let n = 0; n < e.length; n += 2) {
      const s = e[n], i = e[n + 1];
      t <= s - 1 && this.appendRange(t, s - 1), t = i + 1;
    }
    return t <= K.MAX_RUNE && this.appendRange(t, K.MAX_RUNE), this;
  }
  appendTable(e) {
    for (let t = 0; t < e.length; ++t) {
      const n = e.getLo(t), s = e.getHi(t), i = e.getStride(t);
      if (i === 1) {
        this.appendRange(n, s);
        continue;
      }
      for (let o = n; o <= s; o += i) this.appendRange(o, o);
    }
    return this;
  }
  appendNegatedTable(e) {
    let t = 0;
    for (let n = 0; n < e.length; ++n) {
      const s = e.getLo(n), i = e.getHi(n), o = e.getStride(n);
      if (o === 1) {
        t <= s - 1 && this.appendRange(t, s - 1), t = i + 1;
        continue;
      }
      for (let B = s; B <= i; B += o)
        t <= B - 1 && this.appendRange(t, B - 1), t = B + 1;
    }
    return t <= K.MAX_RUNE && this.appendRange(t, K.MAX_RUNE), this;
  }
  appendTableWithSign(e, t) {
    return t < 0 ? this.appendNegatedTable(e) : this.appendTable(e);
  }
  negateClass() {
    let e = 0, t = 0;
    for (let n = 0; n < this.len; n += 2) {
      const s = this.r[n], i = this.r[n + 1];
      e <= s - 1 && (this.r[t] = e, this.r[t + 1] = s - 1, t += 2), e = i + 1;
    }
    return this.len = t, e <= K.MAX_RUNE && (this.r[this.len++] = e, this.r[this.len++] = K.MAX_RUNE), this;
  }
  appendClassWithSign(e, t) {
    return t < 0 ? this.appendNegatedClass(e) : this.appendClass(e);
  }
  appendGroup(e, t) {
    let n = e.cls;
    return t && (n = new an().appendFoldedClass(n).cleanClass().toArray()), this.appendClassWithSign(n, e.sign);
  }
  toString() {
    return an.charClassToString(this.r, this.len);
  }
}, r_ = class {
  constructor(r) {
    this.str = r, this.position = 0;
  }
  pos() {
    return this.position;
  }
  rewindTo(r) {
    this.position = r;
  }
  more() {
    return this.position < this.str.length;
  }
  peek() {
    return this.str.codePointAt(this.position);
  }
  skip(r) {
    this.position += r;
  }
  skipString(r) {
    this.position += r.length;
  }
  pop() {
    const r = this.str.codePointAt(this.position);
    return this.position += W.charCount(r), r;
  }
  lookingAt(r) {
    return this.str.startsWith(r, this.position);
  }
  rest() {
    return this.str.substring(this.position);
  }
  from(r) {
    return this.str.substring(r, this.position);
  }
  toString() {
    return this.rest();
  }
}, G, s_ = (G = class {
  static unicodeTable(e) {
    return e === "Any" ? {
      tab: G.ANY_TABLE,
      fold: G.ANY_TABLE,
      sign: 1
    } : e === "Ascii" ? {
      tab: G.ASCII_TABLE,
      fold: G.ASCII_FOLD_TABLE,
      sign: 1
    } : e === "Assigned" ? {
      tab: nt.CATEGORIES.get("Cn"),
      fold: nt.CATEGORIES.get("Cn"),
      sign: -1
    } : e === "Lc" ? {
      tab: nt.CATEGORIES.get("LC"),
      fold: nt.FOLD_CATEGORIES.get("LC"),
      sign: 1
    } : nt.CATEGORIES.has(e) ? {
      tab: nt.CATEGORIES.get(e),
      fold: nt.FOLD_CATEGORIES.get(e),
      sign: 1
    } : nt.SCRIPTS.has(e) ? {
      tab: nt.SCRIPTS.get(e),
      fold: nt.FOLD_SCRIPT.get(e),
      sign: 1
    } : null;
  }
  static minFoldRune(e) {
    if (e < K.MIN_FOLD || e > K.MAX_FOLD) return e;
    let t = e;
    const n = e;
    for (e = K.simpleFold(e); e !== n; e = K.simpleFold(e)) t > e && (t = e);
    return t;
  }
  static leadingRegexp(e) {
    if (e.op === w.Op.EMPTY_MATCH) return null;
    if (e.op === w.Op.CONCAT && e.subs.length > 0) {
      const t = e.subs[0];
      return t.op === w.Op.EMPTY_MATCH ? null : t;
    }
    return e;
  }
  static literalRegexp(e, t) {
    const n = new w(w.Op.LITERAL);
    return n.flags = t, n.runes = W.stringToRunes(e), n;
  }
  /**
  * Parse regular expression pattern {@code pattern} with mode flags {@code flags}.
  * @param {string} pattern
  * @param {number} flags
  */
  static parse(e, t) {
    return new G(e, t).parseInternal();
  }
  static parseRepeat(e) {
    const t = e.pos();
    if (!e.more() || !e.lookingAt("{")) return -1;
    e.skip(1);
    const n = G.parseInt(e);
    if (n === -1 || !e.more()) return -1;
    let s;
    if (!e.lookingAt(",")) s = n;
    else {
      if (e.skip(1), !e.more()) return -1;
      if (e.lookingAt("}")) s = -1;
      else if ((s = G.parseInt(e)) === -1) return -1;
    }
    if (!e.more() || !e.lookingAt("}")) return -1;
    if (e.skip(1), n < 0 || n > 1e3 || s === -2 || s > 1e3 || s >= 0 && n > s) throw new pe(G.ERR_INVALID_REPEAT_SIZE, e.from(t));
    return n << 16 | s & K.MAX_BMP;
  }
  static isValidCaptureName(e) {
    if (e.length === 0) return !1;
    for (let t = 0; t < e.length; t++) {
      const n = e.codePointAt(t);
      if (n !== b.CODES.get("_") && !W.isalnum(n)) return !1;
    }
    return !0;
  }
  static parseInt(e) {
    const t = e.pos();
    for (; e.more() && e.peek() >= b.CODES.get("0") && e.peek() <= b.CODES.get("9"); ) e.skip(1);
    const n = e.from(t);
    return n.length === 0 || n.length > 1 && n.codePointAt(0) === b.CODES.get("0") ? -1 : n.length > 8 ? -2 : parseInt(n, 10);
  }
  static isCharClass(e) {
    return e.op === w.Op.LITERAL && e.runes.length === 1 || e.op === w.Op.CHAR_CLASS || e.op === w.Op.ANY_CHAR_NOT_NL || e.op === w.Op.ANY_CHAR;
  }
  static matchRune(e, t) {
    switch (e.op) {
      case w.Op.LITERAL:
        return e.runes.length === 1 && e.runes[0] === t;
      case w.Op.CHAR_CLASS:
        for (let n = 0; n < e.runes.length; n += 2) if (e.runes[n] <= t && t <= e.runes[n + 1]) return !0;
        return !1;
      case w.Op.ANY_CHAR_NOT_NL:
        return t !== b.CODES.get(`
`);
      case w.Op.ANY_CHAR:
        return !0;
    }
    return !1;
  }
  static mergeCharClass(e, t) {
    switch (e.op) {
      case w.Op.ANY_CHAR:
        break;
      case w.Op.ANY_CHAR_NOT_NL:
        G.matchRune(t, b.CODES.get(`
`)) && (e.op = w.Op.ANY_CHAR);
        break;
      case w.Op.CHAR_CLASS:
        t.op === w.Op.LITERAL ? e.runes = new sn(e.runes).appendLiteral(t.runes[0], t.flags).toArray() : e.runes = new sn(e.runes).appendClass(t.runes).toArray();
        break;
      case w.Op.LITERAL:
        if (t.runes[0] === e.runes[0] && t.flags === e.flags) break;
        e.op = w.Op.CHAR_CLASS, e.runes = new sn().appendLiteral(e.runes[0], e.flags).appendLiteral(t.runes[0], t.flags).toArray();
        break;
    }
  }
  static parseEscape(e) {
    const t = e.pos();
    if (e.skip(1), !e.more()) throw new pe(G.ERR_TRAILING_BACKSLASH);
    let n = e.pop();
    e: switch (n) {
      case b.CODES.get("1"):
      case b.CODES.get("2"):
      case b.CODES.get("3"):
      case b.CODES.get("4"):
      case b.CODES.get("5"):
      case b.CODES.get("6"):
      case b.CODES.get("7"):
        if (!e.more() || e.peek() < b.CODES.get("0") || e.peek() > b.CODES.get("7")) break;
      case b.CODES.get("0"): {
        let s = n - b.CODES.get("0");
        for (let i = 1; i < 3 && !(!e.more() || e.peek() < b.CODES.get("0") || e.peek() > b.CODES.get("7")); i++)
          s = s * 8 + e.peek() - b.CODES.get("0"), e.skip(1);
        return s;
      }
      case b.CODES.get("x"): {
        if (!e.more()) break;
        if (n = e.pop(), n === b.CODES.get("{")) {
          let o = 0, B = 0;
          for (; ; ) {
            if (!e.more()) break e;
            if (n = e.pop(), n === b.CODES.get("}")) break;
            const u = W.unhex(n);
            if (u < 0 || (B = B * 16 + u, B > K.MAX_RUNE)) break e;
            o++;
          }
          if (o === 0) break e;
          return B;
        }
        const s = W.unhex(n);
        if (!e.more()) break;
        n = e.pop();
        const i = W.unhex(n);
        if (s < 0 || i < 0) break;
        return s * 16 + i;
      }
      case b.CODES.get("a"):
        return b.CODES.get("\x07");
      case b.CODES.get("f"):
        return b.CODES.get("\f");
      case b.CODES.get("n"):
        return b.CODES.get(`
`);
      case b.CODES.get("r"):
        return b.CODES.get("\r");
      case b.CODES.get("t"):
        return b.CODES.get("	");
      case b.CODES.get("v"):
        return b.CODES.get("\v");
      default:
        if (n <= K.MAX_ASCII && !W.isalnum(n)) return n;
        break;
    }
    throw new pe(G.ERR_INVALID_ESCAPE, e.from(t));
  }
  static parseClassChar(e, t) {
    if (!e.more()) throw new pe(G.ERR_MISSING_BRACKET, e.from(t));
    return e.lookingAt("\\") ? G.parseEscape(e) : e.pop();
  }
  static concatRunes(e, t) {
    for (let n = 0; n < t.length; n++) e.push(t[n]);
    return e;
  }
  static hasCapture(e) {
    if (e === null) return !1;
    if (e.op === w.Op.CAPTURE) return !0;
    if (e.subs) {
      for (let t of e.subs) if (G.hasCapture(t)) return !0;
    }
    return !1;
  }
  constructor(e, t = 0) {
    this.wholeRegexp = e, this.flags = t, this.numCap = 0, this.namedGroups = /* @__PURE__ */ Object.create(null), this.stack = [], this.free = null, this.numRegexp = 0, this.numRunes = 0, this.repeats = 0, this.height = null, this.size = null, this.nlb = 0;
  }
  newRegexp(e) {
    let t = this.free;
    return t !== null && t.subs !== null && t.subs.length > 0 ? (this.free = t.subs[0], t.reinit(), t.op = e) : (t = new w(e), this.numRegexp += 1), t;
  }
  reuse(e) {
    this.height !== null && this.height.has(e) && this.height.delete(e), e.subs !== null && e.subs.length > 0 && (e.subs[0] = this.free), this.free = e;
  }
  checkLimits(e) {
    if (this.numRunes > G.MAX_RUNES) throw new pe(G.ERR_LARGE);
    this.checkSize(e), this.checkHeight(e);
  }
  checkSize(e) {
    if (this.size === null) {
      if (this.repeats === 0 && (this.repeats = 1), e.op === w.Op.REPEAT) {
        let t = e.max;
        t === -1 && (t = e.min), t <= 0 && (t = 1), t > Math.floor(G.MAX_SIZE / this.repeats) ? this.repeats = G.MAX_SIZE : this.repeats *= t;
      }
      if (this.numRegexp < Math.floor(G.MAX_SIZE / this.repeats)) return;
      this.size = /* @__PURE__ */ new Map();
      for (let t of this.stack) this.checkSize(t);
    }
    if (this.calcSize(e, !0) > G.MAX_SIZE) throw new pe(G.ERR_LARGE);
  }
  calcSize(e, t = !1) {
    if (!t && this.size !== null && this.size.has(e))
      return this.size.get(e);
    let n = 0;
    switch (e.op) {
      case w.Op.LITERAL:
        n = e.runes.length;
        break;
      case w.Op.PLB:
      case w.Op.NLB:
      case w.Op.CAPTURE:
      case w.Op.STAR:
        n = 2 + this.calcSize(e.subs[0]);
        break;
      case w.Op.PLUS:
      case w.Op.QUEST:
        n = 1 + this.calcSize(e.subs[0]);
        break;
      case w.Op.CONCAT:
        for (let s of e.subs) n = n + this.calcSize(s);
        break;
      case w.Op.ALTERNATE:
        for (let s of e.subs) n = n + this.calcSize(s);
        e.subs.length > 1 && (n = n + e.subs.length - 1);
        break;
      case w.Op.REPEAT: {
        let s = this.calcSize(e.subs[0]);
        if (e.max === -1) {
          e.min === 0 ? n = 2 + s : n = 1 + e.min * s;
          break;
        }
        n = e.max * s + (e.max - e.min);
        break;
      }
    }
    return n = Math.max(1, n), this.size === null && (this.size = /* @__PURE__ */ new Map()), this.size.set(e, n), n;
  }
  checkHeight(e) {
    if (!(this.numRegexp < G.MAX_HEIGHT)) {
      if (this.height === null) {
        this.height = /* @__PURE__ */ new Map();
        for (let t of this.stack) this.checkHeight(t);
      }
      if (this.calcHeight(e, !0) > G.MAX_HEIGHT) throw new pe(G.ERR_NESTING_DEPTH);
    }
  }
  calcHeight(e, t = !1) {
    if (!t && this.height !== null && this.height.has(e))
      return this.height.get(e);
    let n = 1;
    for (let s of e.subs) {
      const i = this.calcHeight(s);
      n < 1 + i && (n = 1 + i);
    }
    return this.height === null && (this.height = /* @__PURE__ */ new Map()), this.height.set(e, n), n;
  }
  pop() {
    return this.stack.pop();
  }
  popToPseudo() {
    const e = this.stack.length;
    let t = e;
    for (; t > 0 && !w.isPseudoOp(this.stack[t - 1].op); ) t--;
    const n = this.stack.slice(t, e);
    return this.stack = this.stack.slice(0, t), n;
  }
  push(e) {
    if (this.numRunes += e.runes.length, e.op === w.Op.CHAR_CLASS && e.runes.length === 2 && e.runes[0] === e.runes[1]) {
      if (this.maybeConcat(e.runes[0], this.flags & -2)) return null;
      e.op = w.Op.LITERAL, e.runes = [e.runes[0]], e.flags = this.flags & -2;
    } else if (e.op === w.Op.CHAR_CLASS && e.runes.length === 4 && e.runes[0] === e.runes[1] && e.runes[2] === e.runes[3] && K.simpleFold(e.runes[0]) === e.runes[2] && K.simpleFold(e.runes[2]) === e.runes[0] || e.op === w.Op.CHAR_CLASS && e.runes.length === 2 && e.runes[0] + 1 === e.runes[1] && K.simpleFold(e.runes[0]) === e.runes[1] && K.simpleFold(e.runes[1]) === e.runes[0]) {
      if (this.maybeConcat(e.runes[0], this.flags | V.FOLD_CASE)) return null;
      e.op = w.Op.LITERAL, e.runes = [e.runes[0]], e.flags = this.flags | V.FOLD_CASE;
    } else this.maybeConcat(-1, 0);
    return this.stack.push(e), this.checkLimits(e), e;
  }
  maybeConcat(e, t) {
    const n = this.stack.length;
    if (n < 2) return !1;
    const s = this.stack[n - 1], i = this.stack[n - 2];
    return s.op !== w.Op.LITERAL || i.op !== w.Op.LITERAL || (s.flags & V.FOLD_CASE) !== (i.flags & V.FOLD_CASE) ? !1 : (i.runes = G.concatRunes(i.runes, s.runes), e >= 0 ? (s.runes = [e], s.flags = t, !0) : (this.pop(), this.reuse(s), !1));
  }
  newLiteral(e, t) {
    const n = this.newRegexp(w.Op.LITERAL);
    return n.flags = t, (t & V.FOLD_CASE) !== 0 && (e = G.minFoldRune(e)), n.runes = [e], n;
  }
  literal(e) {
    this.push(this.newLiteral(e, this.flags));
  }
  op(e) {
    const t = this.newRegexp(e);
    return t.flags = this.flags, this.push(t);
  }
  repeat(e, t, n, s, i, o) {
    let B = this.flags;
    if ((B & V.PERL_X) !== 0 && (i.more() && i.lookingAt("?") && (i.skip(1), B ^= V.NON_GREEDY), o !== -1))
      throw new pe(G.ERR_INVALID_REPEAT_OP, i.from(o));
    const u = this.stack.length;
    if (u === 0) throw new pe(G.ERR_MISSING_REPEAT_ARGUMENT, i.from(s));
    const c = this.stack[u - 1];
    if (w.isPseudoOp(c.op)) throw new pe(G.ERR_MISSING_REPEAT_ARGUMENT, i.from(s));
    const C = this.newRegexp(e);
    if (C.min = t, C.max = n, C.flags = B, C.subs = [c], this.stack[u - 1] = C, this.checkLimits(C), e === w.Op.REPEAT && (t >= 2 || n >= 2) && !this.repeatIsValid(C, 1e3)) throw new pe(G.ERR_INVALID_REPEAT_SIZE, i.from(s));
  }
  repeatIsValid(e, t) {
    if (e.op === w.Op.REPEAT) {
      let n = e.max;
      if (n === 0) return !0;
      if (n < 0 && (n = e.min), n > t) return !1;
      n > 0 && (t = Math.trunc(t / n));
    }
    for (let n of e.subs) if (!this.repeatIsValid(n, t)) return !1;
    return !0;
  }
  concat() {
    this.maybeConcat(-1, 0);
    const e = this.popToPseudo();
    return e.length === 0 ? this.push(this.newRegexp(w.Op.EMPTY_MATCH)) : this.push(this.collapse(e, w.Op.CONCAT));
  }
  alternate() {
    const e = this.popToPseudo();
    return e.length > 0 && this.cleanAlt(e[e.length - 1]), e.length === 0 ? this.push(this.newRegexp(w.Op.NO_MATCH)) : this.push(this.collapse(e, w.Op.ALTERNATE));
  }
  cleanAlt(e) {
    e.op === w.Op.CHAR_CLASS && (e.runes = new sn(e.runes).cleanClass().toArray(), e.runes.length === 2 && e.runes[0] === 0 && e.runes[1] === K.MAX_RUNE ? (e.runes = [], e.op = w.Op.ANY_CHAR) : e.runes.length === 4 && e.runes[0] === 0 && e.runes[1] === b.CODES.get(`
`) - 1 && e.runes[2] === b.CODES.get(`
`) + 1 && e.runes[3] === K.MAX_RUNE && (e.runes = [], e.op = w.Op.ANY_CHAR_NOT_NL));
  }
  collapse(e, t) {
    if (e.length === 1) return e[0];
    let n = 0;
    for (let B of e) n += B.op === t ? B.subs.length : 1;
    let s = new Array(n).fill(null), i = 0;
    for (let B of e) if (B.op === t) {
      for (let u = 0; u < B.subs.length; u++) s[i++] = B.subs[u];
      this.reuse(B);
    } else s[i++] = B;
    let o = this.newRegexp(t);
    if (o.subs = s, t === w.Op.ALTERNATE && (o.subs = this.factor(o.subs), o.subs.length === 1)) {
      const B = o;
      o = o.subs[0], this.reuse(B);
    }
    return o;
  }
  factor(e) {
    if (e.length < 2) return e;
    let t = 0, n = e.length, s = 0, i = null, o = 0, B = 0, u = 0;
    for (let C = 0; C <= n; C++) {
      let f = null, m = 0, R = 0;
      if (C < n) {
        let P = e[t + C];
        if (P.op === w.Op.CONCAT && P.subs.length > 0 && (P = P.subs[0]), P.op === w.Op.LITERAL && (f = P.runes, m = P.runes.length, R = P.flags & V.FOLD_CASE), R === B) {
          let x = 0;
          for (; x < o && x < m && i[x] === f[x]; ) x++;
          if (x > 0) {
            o = x;
            continue;
          }
        }
      }
      if (C !== u) if (C === u + 1) e[s++] = e[t + u];
      else {
        const P = this.newRegexp(w.Op.LITERAL);
        P.flags = B, P.runes = i.slice(0, o);
        for (let z = u; z < C; z++)
          e[t + z] = this.removeLeadingString(e[t + z], o), this.checkLimits(e[t + z]);
        const x = this.collapse(e.slice(t + u, t + C), w.Op.ALTERNATE), H = this.newRegexp(w.Op.CONCAT);
        H.subs = [P, x], e[s++] = H;
      }
      u = C, i = f, o = m, B = R;
    }
    n = s, t = 0, u = 0, s = 0;
    let c = null;
    for (let C = 0; C <= n; C++) {
      let f = null;
      if (!(C < n && (f = G.leadingRegexp(e[t + C]), c !== null && c.equals(f) && (G.isCharClass(c) || c.op === w.Op.REPEAT && c.min === c.max && G.isCharClass(c.subs[0]))))) {
        if (C !== u) if (C === u + 1) e[s++] = e[t + u];
        else {
          const m = c;
          for (let x = u; x < C; x++) {
            const H = x !== u;
            e[t + x] = this.removeLeadingRegexp(e[t + x], H), this.checkLimits(e[t + x]);
          }
          const R = this.collapse(e.slice(t + u, t + C), w.Op.ALTERNATE), P = this.newRegexp(w.Op.CONCAT);
          P.subs = [m, R], e[s++] = P;
        }
        u = C, c = f;
      }
    }
    n = s, t = 0, u = 0, s = 0;
    for (let C = 0; C <= n; C++)
      if (!(C < n && G.isCharClass(e[t + C]))) {
        if (C !== u) if (C === u + 1) e[s++] = e[t + u];
        else {
          let f = u;
          for (let R = u + 1; R < C; R++) {
            const P = e[t + f], x = e[t + R];
            (P.op < x.op || P.op === x.op && (P.runes !== null ? P.runes.length : 0) < (x.runes !== null ? x.runes.length : 0)) && (f = R);
          }
          const m = e[t + u];
          e[t + u] = e[t + f], e[t + f] = m;
          for (let R = u + 1; R < C; R++)
            G.mergeCharClass(e[t + u], e[t + R]), this.reuse(e[t + R]);
          this.cleanAlt(e[t + u]), e[s++] = e[t + u];
        }
        C < n && (e[s++] = e[t + C]), u = C + 1;
      }
    n = s, t = 0, u = 0, s = 0;
    for (let C = 0; C < n; ++C)
      C + 1 < n && e[t + C].op === w.Op.EMPTY_MATCH && e[t + C + 1].op === w.Op.EMPTY_MATCH || (e[s++] = e[t + C]);
    return n = s, t = 0, e.slice(t, n);
  }
  removeLeadingString(e, t) {
    if (e.op === w.Op.CONCAT && e.subs.length > 0) {
      const n = this.removeLeadingString(e.subs[0], t);
      if (e.subs[0] = n, n.op === w.Op.EMPTY_MATCH)
        switch (this.reuse(n), e.subs.length) {
          case 0:
          case 1:
            e.op = w.Op.EMPTY_MATCH, e.subs = w.emptySubs();
            break;
          case 2: {
            const s = e;
            e = e.subs[1], this.reuse(s);
            break;
          }
          default:
            e.subs = e.subs.slice(1, e.subs.length);
            break;
        }
      return e;
    }
    return e.op === w.Op.LITERAL && (e.runes = e.runes.slice(t, e.runes.length), e.runes.length === 0 && (e.op = w.Op.EMPTY_MATCH)), e;
  }
  removeLeadingRegexp(e, t) {
    if (e.op === w.Op.CONCAT && e.subs.length > 0) {
      switch (t && this.reuse(e.subs[0]), e.subs = e.subs.slice(1, e.subs.length), e.subs.length) {
        case 0:
          e.op = w.Op.EMPTY_MATCH, e.subs = w.emptySubs();
          break;
        case 1: {
          const n = e;
          e = e.subs[0], this.reuse(n);
          break;
        }
      }
      return e;
    }
    return t && this.reuse(e), this.newRegexp(w.Op.EMPTY_MATCH);
  }
  parseInternal() {
    if ((this.flags & V.LITERAL) !== 0) return G.literalRegexp(this.wholeRegexp, this.flags);
    let e = -1, t = -1, n = -1;
    const s = new r_(this.wholeRegexp);
    for (; s.more(); ) {
      let i = -1;
      e: switch (s.peek()) {
        case b.CODES.get("("):
          if ((this.flags & V.LOOKBEHIND) !== 0) {
            if (s.lookingAt("(?<=")) {
              this.parsePosLookBehind(), s.skip(4);
              break;
            }
            if (s.lookingAt("(?<!")) {
              this.parseNegLookBehind(), s.skip(4);
              break;
            }
          }
          if ((this.flags & V.PERL_X) !== 0 && s.lookingAt("(?")) {
            this.parsePerlFlags(s);
            break;
          }
          this.op(w.Op.LEFT_PAREN).cap = ++this.numCap, s.skip(1);
          break;
        case b.CODES.get("|"):
          this.parseVerticalBar(), s.skip(1);
          break;
        case b.CODES.get(")"):
          this.parseRightParen(), s.skip(1);
          break;
        case b.CODES.get("^"):
          (this.flags & V.ONE_LINE) !== 0 ? this.op(w.Op.BEGIN_TEXT) : this.op(w.Op.BEGIN_LINE), s.skip(1);
          break;
        case b.CODES.get("$"):
          (this.flags & V.ONE_LINE) !== 0 ? this.op(w.Op.END_TEXT).flags |= V.WAS_DOLLAR : this.op(w.Op.END_LINE), s.skip(1);
          break;
        case b.CODES.get("."):
          (this.flags & V.DOT_NL) !== 0 ? this.op(w.Op.ANY_CHAR) : this.op(w.Op.ANY_CHAR_NOT_NL), s.skip(1);
          break;
        case b.CODES.get("["):
          this.parseClass(s);
          break;
        case b.CODES.get("*"):
        case b.CODES.get("+"):
        case b.CODES.get("?"): {
          i = s.pos();
          let o = null;
          switch (s.pop()) {
            case b.CODES.get("*"):
              o = w.Op.STAR;
              break;
            case b.CODES.get("+"):
              o = w.Op.PLUS;
              break;
            case b.CODES.get("?"):
              o = w.Op.QUEST;
              break;
          }
          this.repeat(o, t, n, i, s, e);
          break;
        }
        case b.CODES.get("{"): {
          i = s.pos();
          const o = G.parseRepeat(s);
          if (o < 0) {
            s.rewindTo(i), this.literal(s.pop());
            break;
          }
          t = o >> 16, n = (o & K.MAX_BMP) << 16 >> 16, this.repeat(w.Op.REPEAT, t, n, i, s, e);
          break;
        }
        case b.CODES.get("\\"): {
          const o = s.pos();
          if (s.skip(1), (this.flags & V.PERL_X) !== 0 && s.more()) switch (s.pop()) {
            case b.CODES.get("A"):
              this.op(w.Op.BEGIN_TEXT);
              break e;
            case b.CODES.get("b"):
              this.op(w.Op.WORD_BOUNDARY);
              break e;
            case b.CODES.get("B"):
              this.op(w.Op.NO_WORD_BOUNDARY);
              break e;
            case b.CODES.get("C"):
              throw new pe(G.ERR_INVALID_ESCAPE, "\\C");
            case b.CODES.get("Q"): {
              let c = s.rest();
              const C = c.indexOf("\\E");
              C >= 0 ? (c = c.substring(0, C), s.skipString(c), s.skipString("\\E")) : s.skipString(c);
              let f = 0;
              for (; f < c.length; ) {
                const m = c.codePointAt(f);
                this.literal(m), f += W.charCount(m);
              }
              break e;
            }
            case b.CODES.get("z"):
              this.op(w.Op.END_TEXT);
              break e;
            default:
              s.rewindTo(o);
              break;
          }
          else s.rewindTo(o);
          const B = this.newRegexp(w.Op.CHAR_CLASS);
          if (B.flags = this.flags, s.lookingAt("\\p") || s.lookingAt("\\P")) {
            const c = new sn();
            if (this.parseUnicodeClass(s, c)) {
              B.runes = c.toArray(), this.push(B);
              break e;
            }
          }
          const u = new sn();
          if (this.parsePerlClassEscape(s, u)) {
            B.runes = u.toArray(), this.push(B);
            break e;
          }
          s.rewindTo(o), this.reuse(B), this.literal(G.parseEscape(s));
          break;
        }
        default:
          this.literal(s.pop());
          break;
      }
      e = i;
    }
    if (this.concat(), this.swapVerticalBar() && this.pop(), this.alternate(), this.stack.length !== 1) throw new pe(G.ERR_MISSING_PAREN, this.wholeRegexp);
    return this.stack[0].namedGroups = this.namedGroups, this.stack[0];
  }
  parsePerlFlags(e) {
    const t = e.pos(), n = e.rest();
    if (n.startsWith("(?P<") || n.startsWith("(?<")) {
      const B = n.charAt(2) === "P" ? 4 : 3, u = n.indexOf(">");
      if (u < 0) throw new pe(G.ERR_INVALID_NAMED_CAPTURE, n);
      const c = n.substring(B, u);
      if (e.skipString(c), e.skip(B + 1), !G.isValidCaptureName(c)) throw new pe(G.ERR_INVALID_NAMED_CAPTURE, n.substring(0, u + 1));
      const C = this.op(w.Op.LEFT_PAREN);
      if (C.cap = ++this.numCap, this.namedGroups[c]) throw new pe(G.ERR_DUPLICATE_NAMED_CAPTURE, c);
      this.namedGroups[c] = this.numCap, C.name = c;
      return;
    }
    e.skip(2);
    let s = this.flags, i = 1, o = !1;
    e: for (; e.more(); ) {
      const B = e.pop();
      switch (B) {
        case b.CODES.get("i"):
          s |= V.FOLD_CASE, o = !0;
          break;
        case b.CODES.get("m"):
          s &= -17, o = !0;
          break;
        case b.CODES.get("s"):
          s |= V.DOT_NL, o = !0;
          break;
        case b.CODES.get("U"):
          s |= V.NON_GREEDY, o = !0;
          break;
        case b.CODES.get("-"):
          if (i < 0) break e;
          i = -1, s = ~s, o = !1;
          break;
        case b.CODES.get(":"):
        case b.CODES.get(")"):
          if (i < 0) {
            if (!o) break e;
            s = ~s;
          }
          B === b.CODES.get(":") && this.op(w.Op.LEFT_PAREN), this.flags = s;
          return;
        default:
          break e;
      }
    }
    throw new pe(G.ERR_INVALID_PERL_OP, e.from(t));
  }
  parsePosLookBehind() {
    const e = this.newRegexp(w.Op.LEFT_PAREN);
    return e.flags = this.flags, e.lb = ++this.nlb, this.push(e);
  }
  parseNegLookBehind() {
    const e = this.newRegexp(w.Op.LEFT_PAREN);
    return e.flags = this.flags, e.lb = -++this.nlb, this.push(e);
  }
  parseVerticalBar() {
    this.concat(), this.swapVerticalBar() || this.op(w.Op.VERTICAL_BAR);
  }
  swapVerticalBar() {
    const e = this.stack.length;
    if (e >= 3 && this.stack[e - 2].op === w.Op.VERTICAL_BAR && G.isCharClass(this.stack[e - 1]) && G.isCharClass(this.stack[e - 3])) {
      let t = this.stack[e - 1], n = this.stack[e - 3];
      if (t.op > n.op) {
        const s = n;
        n = t, t = s, this.stack[e - 3] = n;
      }
      return G.mergeCharClass(n, t), this.reuse(t), this.pop(), !0;
    }
    if (e >= 2) {
      const t = this.stack[e - 1], n = this.stack[e - 2];
      if (n.op === w.Op.VERTICAL_BAR)
        return e >= 3 && this.cleanAlt(this.stack[e - 3]), this.stack[e - 2] = t, this.stack[e - 1] = n, !0;
    }
    return !1;
  }
  parseRightParen() {
    if (this.concat(), this.swapVerticalBar() && this.pop(), this.alternate(), this.stack.length < 2) throw new pe(G.ERR_UNEXPECTED_PAREN, this.wholeRegexp);
    const e = this.pop(), t = this.pop();
    if (t.op !== w.Op.LEFT_PAREN) throw new pe(G.ERR_UNEXPECTED_PAREN, this.wholeRegexp);
    if (this.flags = t.flags, t.lb !== 0) {
      if (G.hasCapture(e)) throw new pe(G.ERR_INVALID_CAPTURE_IN_LOOKBEHIND, this.wholeRegexp);
      t.lb > 0 ? t.op = w.Op.PLB : t.op = w.Op.NLB, t.subs = [e], this.push(t);
      return;
    }
    t.cap === 0 ? this.push(e) : (t.op = w.Op.CAPTURE, t.subs = [e], this.push(t));
  }
  parsePerlClassEscape(e, t) {
    const n = e.pos();
    if ((this.flags & V.PERL_X) === 0 || !e.more() || e.pop() !== b.CODES.get("\\") || !e.more()) return !1;
    e.pop();
    const s = e.from(n), i = el.has(s) ? el.get(s) : null;
    return i === null ? !1 : (t.appendGroup(i, (this.flags & V.FOLD_CASE) !== 0), !0);
  }
  parseNamedClass(e, t) {
    const n = e.rest(), s = n.indexOf(":]");
    if (s < 0) return !1;
    const i = n.substring(0, s + 2);
    e.skipString(i);
    const o = dl.has(i) ? dl.get(i) : null;
    if (o === null) throw new pe(G.ERR_INVALID_CHAR_RANGE, i);
    return t.appendGroup(o, (this.flags & V.FOLD_CASE) !== 0), !0;
  }
  parseUnicodeClass(e, t) {
    const n = e.pos();
    if ((this.flags & V.UNICODE_GROUPS) === 0 || !e.lookingAt("\\p") && !e.lookingAt("\\P")) return !1;
    e.skip(1);
    let s = 1, i = e.pop();
    if (i === b.CODES.get("P") && (s = -1), !e.more())
      throw e.rewindTo(n), new pe(G.ERR_INVALID_CHAR_RANGE, e.rest());
    i = e.pop();
    let o;
    if (i !== b.CODES.get("{")) o = W.runeToString(i);
    else {
      const C = e.rest(), f = C.indexOf("}");
      if (f < 0)
        throw e.rewindTo(n), new pe(G.ERR_INVALID_CHAR_RANGE, e.rest());
      o = C.substring(0, f), e.skipString(o), e.skip(1);
    }
    o.length !== 0 && o.codePointAt(0) === b.CODES.get("^") && (s = 0 - s, o = o.substring(1));
    const B = G.unicodeTable(o);
    if (B === null) throw new pe(G.ERR_INVALID_CHAR_RANGE, e.from(n));
    B.sign < 0 && (s = 0 - s);
    const u = B.tab, c = B.fold;
    if ((this.flags & V.FOLD_CASE) === 0 || c === null) t.appendTableWithSign(u, s);
    else {
      const C = new sn().appendTable(u).appendTable(c).cleanClass().toArray();
      t.appendClassWithSign(C, s);
    }
    return !0;
  }
  parseClass(e) {
    const t = e.pos();
    e.skip(1);
    const n = this.newRegexp(w.Op.CHAR_CLASS);
    n.flags = this.flags;
    const s = new sn();
    let i = 1;
    e.more() && e.lookingAt("^") && (i = -1, e.skip(1), (this.flags & V.CLASS_NL) === 0 && s.appendRange(b.CODES.get(`
`), b.CODES.get(`
`)));
    let o = !0;
    for (; !e.more() || e.peek() !== b.CODES.get("]") || o; ) {
      if (e.more() && e.lookingAt("-") && (this.flags & V.PERL_X) === 0 && !o) {
        const C = e.rest();
        if (C === "-" || !C.startsWith("-]"))
          throw e.rewindTo(t), new pe(G.ERR_INVALID_CHAR_RANGE, e.rest());
      }
      o = !1;
      const B = e.pos();
      if (e.lookingAt("[:")) {
        if (this.parseNamedClass(e, s)) continue;
        e.rewindTo(B);
      }
      if (this.parseUnicodeClass(e, s) || this.parsePerlClassEscape(e, s)) continue;
      e.rewindTo(B);
      const u = G.parseClassChar(e, t);
      let c = u;
      if (e.more() && e.lookingAt("-")) {
        if (e.skip(1), e.more() && e.lookingAt("]")) e.skip(-1);
        else if (c = G.parseClassChar(e, t), c < u) throw new pe(G.ERR_INVALID_CHAR_RANGE, e.from(B));
      }
      (this.flags & V.FOLD_CASE) === 0 ? s.appendRange(u, c) : s.appendFoldedRange(u, c);
    }
    e.skip(1), s.cleanClass(), i < 0 && s.negateClass(), n.runes = s.toArray(), this.push(n);
  }
}, M(G, "ERR_INTERNAL_ERROR", "regexp/syntax: internal error"), M(G, "ERR_INVALID_CHAR_RANGE", "invalid character class range"), M(G, "ERR_INVALID_ESCAPE", "invalid escape sequence"), M(G, "ERR_INVALID_NAMED_CAPTURE", "invalid named capture"), M(G, "ERR_INVALID_PERL_OP", "invalid or unsupported Perl syntax"), M(G, "ERR_INVALID_REPEAT_OP", "invalid nested repetition operator"), M(G, "ERR_INVALID_REPEAT_SIZE", "invalid repeat count"), M(G, "ERR_MISSING_BRACKET", "missing closing ]"), M(G, "ERR_MISSING_PAREN", "missing closing )"), M(G, "ERR_MISSING_REPEAT_ARGUMENT", "missing argument to repetition operator"), M(G, "ERR_TRAILING_BACKSLASH", "trailing backslash at end of expression"), M(G, "ERR_DUPLICATE_NAMED_CAPTURE", "duplicate capture group name"), M(G, "ERR_UNEXPECTED_PAREN", "unexpected )"), M(G, "ERR_NESTING_DEPTH", "expression nests too deeply"), M(G, "ERR_LARGE", "expression too large"), M(G, "ERR_INVALID_CAPTURE_IN_LOOKBEHIND", "invalid capture in lookbehind"), M(G, "MAX_HEIGHT", 1e3), M(G, "MAX_SIZE", 3355443), M(G, "MAX_RUNES", 33554432), M(G, "ANY_TABLE", new p(new Uint32Array([
  0,
  K.MAX_RUNE,
  1
]))), M(G, "ASCII_TABLE", new p(new Uint32Array([
  0,
  127,
  1
]))), M(G, "ASCII_FOLD_TABLE", new p(new Uint32Array([
  0,
  127,
  1,
  383,
  383,
  1,
  8490,
  8490,
  1
]))), G), i_ = class jn {
  static initTest(e) {
    const t = jn.compile(e), n = new jn(t.expr, t.prog, t.numSubexp, t.longest);
    return n.cond = t.cond, n.prefix = t.prefix, n.prefixUTF8 = t.prefixUTF8, n.prefixComplete = t.prefixComplete, n.prefixRune = t.prefixRune, n.prefilter = t.prefilter, n;
  }
  /**
  * Parses a regular expression and returns, if successful, an {@code RE2} instance that can be
  * used to match against text.
  *
  * When matching against text, the regexp returns a match that begins as early as possible in the
  * input (leftmost), and among those it chooses the one that a backtracking search would have
  * found first. This so-called leftmost-first matching is the same semantics that Perl, Python,
  * and other implementations use, although this package implements it without the expense of
  * backtracking. For POSIX leftmost-longest matching, see {@link #compilePOSIX}.
  */
  static compile(e) {
    return jn.compileImpl(e, V.PERL, !1);
  }
  /**
  * {@code compilePOSIX} is like {@link #compile} but restricts the regular expression to POSIX ERE
  * (egrep) syntax and changes the match semantics to leftmost-longest.
  *
  * That is, when matching against text, the regexp returns a match that begins as early as
  * possible in the input (leftmost), and among those it chooses a match that is as long as
  * possible. This so-called leftmost-longest matching is the same semantics that early regular
  * expression implementations used and that POSIX specifies.
  *
  * However, there can be multiple leftmost-longest matches, with different submatch choices, and
  * here this package diverges from POSIX. Among the possible leftmost-longest matches, this
  * package chooses the one that a backtracking search would have found first, while POSIX
  * specifies that the match be chosen to maximize the length of the first subexpression, then the
  * second, and so on from left to right. The POSIX rule is computationally prohibitive and not
  * even well-defined. See http://swtch.com/~rsc/regexp/regexp2.html#posix
  */
  static compilePOSIX(e) {
    return jn.compileImpl(e, V.POSIX, !0);
  }
  static compileImpl(e, t, n) {
    let s = s_.parse(e, t);
    const i = s.maxCap();
    s = n_.simplify(s);
    const o = ZE.build(s), B = t_.compileRegexp(s), u = new jn(e, B, i, n);
    u.prefilter = o.type === le.Type.NONE ? null : o;
    const [c, C] = B.prefix();
    return u.prefixComplete = c, u.prefix = C, u.prefixUTF8 = W.stringToUtf8ByteArray(u.prefix), u.prefix.length > 0 && (u.prefixRune = u.prefix.codePointAt(0)), u.namedGroups = s.namedGroups, u;
  }
  /**
  * Returns true iff textual regular expression {@code pattern} matches string {@code s}.
  *
  * More complicated queries need to use {@link #compile} and the full {@code RE2} interface.
  */
  static match(e, t) {
    return jn.compile(e).match(t);
  }
  constructor(e, t, n = 0, s = 0) {
    this.expr = e, this.prog = t, this.numSubexp = n, this.longest = s, this.cond = t.startCond(), this.prefix = null, this.prefixUTF8 = null, this.prefixComplete = !1, this.prefixRune = 0, this.machinePool = [], this.dfa = new JE(this.prog), this.onepass = Wc.compile(this.prog), this.prefilter = null;
  }
  matchPrefixComplete(e, t, n, s) {
    if ((n === V.ANCHOR_START || n === V.ANCHOR_BOTH) && t !== 0) return null;
    let i = -1, o = -1;
    const B = e.prefixLength(this);
    if (n === V.UNANCHORED) {
      const u = e.index(this, t);
      if (u < 0) return null;
      i = t + u, o = i + B;
    } else if (n === V.ANCHOR_BOTH) {
      if (e.endPos() !== B || e.index(this, 0) !== 0) return null;
      i = 0, o = B;
    } else if (n === V.ANCHOR_START) {
      if (e.index(this, 0) !== 0) return null;
      i = 0, o = B;
    }
    if (i < 0) return null;
    if (s > 0) {
      const u = new Int32Array(s).fill(-1);
      return u[0] = i, u[1] = o, Array.from(u);
    }
    return [];
  }
  executeEngine(e, t, n, s) {
    if (this.prefixComplete && (s === 0 || this.numSubexp === 0)) return this.matchPrefixComplete(e, t, n, s);
    if (this.prefilter !== null && n === V.UNANCHORED && !this.prefilter.eval(e, t))
      return null;
    if (this.onepass !== null) return Wc.execute(this, e, t, n, s);
    if (s > 0)
      return this.prog.numLb === 0 && e.endPos() <= bi.maxBitStateLen(this.prog) ? bi.execute(this, e, t, n, s) : this.doExecuteNFA(e, t, n, s);
    if (this.prog.numLb === 0) {
      const i = this.dfa.match(e, t, n);
      if (i !== null) return i ? [] : null;
      if (e.endPos() <= bi.maxBitStateLen(this.prog)) return bi.execute(this, e, t, n, s);
    }
    return this.doExecuteNFA(e, t, n, s);
  }
  /**
  * Returns the number of parenthesized subexpressions in this regular expression.
  */
  numberOfCapturingGroups() {
    return this.numSubexp;
  }
  /**
  * Returns the number of instructions in this compiled regular expression program.
  */
  numberOfInstructions() {
    return this.prog.numInst();
  }
  get() {
    return this.machinePool.length > 0 ? this.machinePool.pop() : null;
  }
  reset() {
    this.machinePool.length = 0;
  }
  put(e) {
    this.machinePool.push(e);
  }
  toString() {
    return this.expr;
  }
  doExecuteNFA(e, t, n, s) {
    let i = this.get();
    i || (i = GE.fromRE2(this)), i.init(s);
    const o = i.match(e, t, n) ? i.submatches() : null;
    return this.put(i), o;
  }
  match(e) {
    return this.executeEngine(me.fromUTF16(e), 0, V.UNANCHORED, 0) !== null;
  }
  /**
  * Matches the regular expression against input starting at position start and ending at position
  * end, with the given anchoring. Records the submatch boundaries in group, which is [start, end)
  * pairs of byte offsets. The number of boundaries needed is inferred from the size of the group
  * array. It is most efficient not to ask for submatch boundaries.
  *
  * @param input the input byte array
  * @param start the beginning position in the input
  * @param end the end position in the input
  * @param anchor the anchoring flag (UNANCHORED, ANCHOR_START, ANCHOR_BOTH)
  * @param group the array to fill with submatch positions
  * @param ngroup the number of array pairs to fill in
  * @returns true if a match was found
  */
  matchWithGroup(e, t, n, s, i) {
    return e instanceof er || (W.isByteArray(e) ? e = Kn.utf8(e) : e = Kn.utf16(e)), this.matchMachineInput(e, t, n, s, i);
  }
  matchMachineInput(e, t, n, s, i) {
    if (t > n) return [!1, null];
    const o = e.isUTF16Encoding() ? me.fromUTF16(e.asCharSequence(), 0, n) : me.fromUTF8(e.asBytes(), 0, n), B = this.executeEngine(o, t, s, 2 * i);
    return B === null ? [!1, null] : [!0, B];
  }
  /**
  * Returns true iff this regexp matches the UTF-8 byte array {@code b}.
  */
  matchUTF8(e) {
    return this.executeEngine(me.fromUTF8(e), 0, V.UNANCHORED, 0) !== null;
  }
  /**
  * Returns a copy of {@code src} in which all matches for this regexp have been replaced by
  * {@code repl}. No support is provided for expressions (e.g. {@code \1} or {@code $1}) in the
  * replacement string.
  */
  replaceAll(e, t) {
    return this.replaceAllFunc(e, () => t, 2 * e.length + 1);
  }
  /**
  * Returns a copy of {@code src} in which only the first match for this regexp has been replaced
  * by {@code repl}. No support is provided for expressions (e.g. {@code \1} or {@code $1}) in the
  * replacement string.
  */
  replaceFirst(e, t) {
    return this.replaceAllFunc(e, () => t, 1);
  }
  /**
  * Returns a copy of {@code src} in which at most {@code maxReplaces} matches for this regexp have
  * been replaced by the return value of of function {@code repl} (whose first argument is the
  * matched string). No support is provided for expressions (e.g. {@code \1} or {@code $1}) in the
  * replacement string.
  */
  replaceAllFunc(e, t, n) {
    let s = 0, i = 0, o = "";
    const B = me.fromUTF16(e);
    let u = 0;
    for (; i <= e.length; ) {
      const c = this.executeEngine(B, i, V.UNANCHORED, 2);
      if (c === null || c.length === 0) break;
      o += e.substring(s, c[0]), (c[1] > s || c[0] === 0) && (o += t(e.substring(c[0], c[1])), u++), s = c[1];
      const C = B.step(i) & 7;
      if (i + C > c[1] ? i += C : i + 1 > c[1] ? i++ : i = c[1], u >= n) break;
    }
    return o += e.substring(s), o;
  }
  pad(e) {
    if (e === null) return null;
    let t = (1 + this.numSubexp) * 2;
    if (e.length < t) {
      let n = new Array(t).fill(-1);
      for (let s = 0; s < e.length; s++) n[s] = e[s];
      e = n;
    }
    return e;
  }
  allMatches(e, t, n = (s) => s) {
    let s = [];
    const i = e.endPos();
    t < 0 && (t = i + 1);
    let o = 0, B = 0, u = -1;
    for (; B < t && o <= i; ) {
      const c = this.executeEngine(e, o, V.UNANCHORED, this.prog.numCap);
      if (c === null || c.length === 0) break;
      let C = !0;
      if (c[1] === o) {
        c[0] === u && (C = !1);
        const f = e.step(o);
        f < 0 ? o = i + 1 : o += f & 7;
      } else o = c[1];
      u = c[1], C && (s.push(n(this.pad(c))), B++);
    }
    return s;
  }
  /**
  * Returns an array holding the text of the leftmost match in {@code b} of this regular
  * expression.
  *
  * A return value of null indicates no match.
  */
  findUTF8(e) {
    const t = this.executeEngine(me.fromUTF8(e), 0, V.UNANCHORED, 2);
    return t === null ? null : e.slice(t[0], t[1]);
  }
  /**
  * Returns a two-element array of integers defining the location of the leftmost match in
  * {@code b} of this regular expression. The match itself is at {@code b[loc[0]...loc[1]]}.
  *
  * A return value of null indicates no match.
  */
  findUTF8Index(e) {
    const t = this.executeEngine(me.fromUTF8(e), 0, V.UNANCHORED, 2);
    return t === null ? null : t.slice(0, 2);
  }
  /**
  * Returns a string holding the text of the leftmost match in {@code s} of this regular
  * expression.
  *
  * If there is no match, the return value is an empty string, but it will also be empty if the
  * regular expression successfully matches an empty string. Use {@link #findIndex} or
  * {@link #findSubmatch} if it is necessary to distinguish these cases.
  */
  find(e) {
    const t = this.executeEngine(me.fromUTF16(e), 0, V.UNANCHORED, 2);
    return t === null ? "" : e.substring(t[0], t[1]);
  }
  /**
  * Returns a two-element array of integers defining the location of the leftmost match in
  * {@code s} of this regular expression. The match itself is at
  * {@code s.substring(loc[0], loc[1])}.
  *
  * A return value of null indicates no match.
  */
  findIndex(e) {
    return this.executeEngine(me.fromUTF16(e), 0, V.UNANCHORED, 2);
  }
  /**
  * Returns an array of arrays the text of the leftmost match of the regular expression in
  * {@code b} and the matches, if any, of its subexpressions, as defined by the <a
  * href='#submatch'>Submatch</a> description above.
  *
  * A return value of null indicates no match.
  */
  findUTF8Submatch(e) {
    const t = this.executeEngine(me.fromUTF8(e), 0, V.UNANCHORED, this.prog.numCap);
    if (t === null) return null;
    const n = new Array(1 + this.numSubexp).fill(null);
    for (let s = 0; s < n.length; s++) 2 * s < t.length && t[2 * s] >= 0 && (n[s] = e.slice(t[2 * s], t[2 * s + 1]));
    return n;
  }
  /**
  * Returns an array holding the index pairs identifying the leftmost match of this regular
  * expression in {@code b} and the matches, if any, of its subexpressions, as defined by the the
  * <a href='#submatch'>Submatch</a> and <a href='#index'>Index</a> descriptions above.
  *
  * A return value of null indicates no match.
  */
  findUTF8SubmatchIndex(e) {
    return this.pad(this.executeEngine(me.fromUTF8(e), 0, V.UNANCHORED, this.prog.numCap));
  }
  /**
  * Returns an array of strings holding the text of the leftmost match of the regular expression in
  * {@code s} and the matches, if any, of its subexpressions, as defined by the <a
  * href='#submatch'>Submatch</a> description above.
  *
  * A return value of null indicates no match.
  */
  findSubmatch(e) {
    const t = this.executeEngine(me.fromUTF16(e), 0, V.UNANCHORED, this.prog.numCap);
    if (t === null) return null;
    const n = new Array(1 + this.numSubexp).fill(null);
    for (let s = 0; s < n.length; s++) 2 * s < t.length && t[2 * s] >= 0 && (n[s] = e.substring(t[2 * s], t[2 * s + 1]));
    return n;
  }
  /**
  * Returns an array holding the index pairs identifying the leftmost match of this regular
  * expression in {@code s} and the matches, if any, of its subexpressions, as defined by the <a
  * href='#submatch'>Submatch</a> description above.
  *
  * A return value of null indicates no match.
  */
  findSubmatchIndex(e) {
    return this.pad(this.executeEngine(me.fromUTF16(e), 0, V.UNANCHORED, this.prog.numCap));
  }
  /**
  * {@code findAllUTF8()} is the <a href='#all'>All</a> version of {@link #findUTF8}; it returns a
  * list of up to {@code n} successive matches of the expression, as defined by the <a
  * href='#all'>All</a> description above.
  *
  * A return value of null indicates no match.
  *
  * TODO(adonovan): think about defining a byte slice view class, like a read-only Go slice backed
  * by |b|.
  */
  findAllUTF8(e, t) {
    const n = this.allMatches(me.fromUTF8(e), t, (s) => e.slice(s[0], s[1]));
    return n.length === 0 ? null : n;
  }
  /**
  * {@code findAllUTF8Index} is the <a href='#all'>All</a> version of {@link #findUTF8Index}; it
  * returns a list of up to {@code n} successive matches of the expression, as defined by the <a
  * href='#all'>All</a> description above.
  *
  * A return value of null indicates no match.
  */
  findAllUTF8Index(e, t) {
    const n = this.allMatches(me.fromUTF8(e), t, (s) => s.slice(0, 2));
    return n.length === 0 ? null : n;
  }
  /**
  * {@code findAll} is the <a href='#all'>All</a> version of {@link #find}; it returns a list of up
  * to {@code n} successive matches of the expression, as defined by the <a href='#all'>All</a>
  * description above.
  *
  * A return value of null indicates no match.
  */
  findAll(e, t) {
    const n = this.allMatches(me.fromUTF16(e), t, (s) => e.substring(s[0], s[1]));
    return n.length === 0 ? null : n;
  }
  /**
  * {@code findAllIndex} is the <a href='#all'>All</a> version of {@link #findIndex}; it returns a
  * list of up to {@code n} successive matches of the expression, as defined by the <a
  * href='#all'>All</a> description above.
  *
  * A return value of null indicates no match.
  */
  findAllIndex(e, t) {
    const n = this.allMatches(me.fromUTF16(e), t, (s) => s.slice(0, 2));
    return n.length === 0 ? null : n;
  }
  /**
  * {@code findAllUTF8Submatch} is the <a href='#all'>All</a> version of {@link #findUTF8Submatch};
  * it returns a list of up to {@code n} successive matches of the expression, as defined by the <a
  * href='#all'>All</a> description above.
  *
  * A return value of null indicates no match.
  */
  findAllUTF8Submatch(e, t) {
    const n = this.allMatches(me.fromUTF8(e), t, (s) => {
      let i = new Array(s.length / 2 | 0).fill(null);
      for (let o = 0; o < i.length; o++) s[2 * o] >= 0 && (i[o] = e.slice(s[2 * o], s[2 * o + 1]));
      return i;
    });
    return n.length === 0 ? null : n;
  }
  /**
  * {@code findAllUTF8SubmatchIndex} is the <a href='#all'>All</a> version of
  * {@link #findUTF8SubmatchIndex}; it returns a list of up to {@code n} successive matches of the
  * expression, as defined by the <a href='#all'>All</a> description above.
  *
  * A return value of null indicates no match.
  */
  findAllUTF8SubmatchIndex(e, t) {
    const n = this.allMatches(me.fromUTF8(e), t);
    return n.length === 0 ? null : n;
  }
  /**
  * {@code findAllSubmatch} is the <a href='#all'>All</a> version of {@link #findSubmatch}; it
  * returns a list of up to {@code n} successive matches of the expression, as defined by the <a
  * href='#all'>All</a> description above.
  *
  * A return value of null indicates no match.
  */
  findAllSubmatch(e, t) {
    const n = this.allMatches(me.fromUTF16(e), t, (s) => {
      let i = new Array(s.length / 2 | 0).fill(null);
      for (let o = 0; o < i.length; o++) s[2 * o] >= 0 && (i[o] = e.substring(s[2 * o], s[2 * o + 1]));
      return i;
    });
    return n.length === 0 ? null : n;
  }
  /**
  * {@code findAllSubmatchIndex} is the <a href='#all'>All</a> version of
  * {@link #findSubmatchIndex}; it returns a list of up to {@code n} successive matches of the
  * expression, as defined by the <a href='#all'>All</a> description above.
  *
  * A return value of null indicates no match.
  */
  findAllSubmatchIndex(e, t) {
    const n = this.allMatches(me.fromUTF16(e), t);
    return n.length === 0 ? null : n;
  }
}, o_ = class hr {
  static isHexadecimal(e) {
    return "0" <= e && e <= "9" || "A" <= e && e <= "F" || "a" <= e && e <= "f";
  }
  static translate(e) {
    let t = "";
    if (e instanceof RegExp && (e.ignoreCase && (t += "i"), e.multiline && (t += "m"), e.dotAll && (t += "s"), e = e.source), typeof e != "string") return e;
    let n = "", s = !1, i = e.length;
    i === 0 && (n = "(?:)", s = !0);
    let o = !1, B = 0;
    for (; B < i; ) {
      let c = e[B];
      if (c === "\\") {
        if (B + 1 < i)
          switch (c = e[B + 1], c) {
            case "\\":
              n += "\\\\", B += 2;
              continue;
            case "c":
              if (B + 2 < i) {
                let m = e[B + 2].charCodeAt(0);
                if (m >= 65 && m <= 90 || m >= 97 && m <= 122) {
                  let R = m % 32;
                  n += "\\x", n += (R >> 4).toString(16).toUpperCase(), n += (R & 15).toString(16).toUpperCase(), B += 3, s = !0;
                  continue;
                }
              }
              n += "c", B += 2, s = !0;
              continue;
            case "u":
              if (B + 2 < i) {
                if (e[B + 2] === "{") {
                  let m = B + 3, R = !1, P = !1;
                  for (; m < i; ) {
                    const x = e[m];
                    if (x === "}") {
                      P = !0;
                      break;
                    }
                    if (!hr.isHexadecimal(x)) break;
                    R = !0, m++;
                  }
                  if (P && R) {
                    n += "\\x", B += 2, s = !0;
                    continue;
                  }
                } else if (B + 5 < i) {
                  let m = !0;
                  for (let R = 0; R < 4; R++) if (!hr.isHexadecimal(e[B + 2 + R])) {
                    m = !1;
                    break;
                  }
                  if (m) {
                    n += "\\x{" + e.substring(B + 2, B + 6) + "}", B += 6, s = !0;
                    continue;
                  }
                }
              }
              n += "u", B += 2, s = !0;
              continue;
            case "x": {
              let m = !1;
              if (B + 2 < i && e[B + 2] === "{") {
                let R = B + 3, P = !1, x = !1;
                for (; R < i; ) {
                  const H = e[R];
                  if (H === "}") {
                    x = !0;
                    break;
                  }
                  if (!hr.isHexadecimal(H)) break;
                  P = !0, R++;
                }
                x && P && (m = !0);
              } else B + 3 < i && hr.isHexadecimal(e[B + 2]) && hr.isHexadecimal(e[B + 3]) && (m = !0);
              m ? (n += "\\x", B += 2) : (n += "x", B += 2, s = !0);
              continue;
            }
            case "n":
            case "r":
            case "t":
            case "a":
            case "f":
            case "v":
            case "d":
            case "D":
            case "s":
            case "S":
            case "w":
            case "W":
            case "b":
            case "B":
            case "p":
            case "P":
            case "A":
            case "z":
            case "Q":
            case "E":
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
              n += "\\" + c, B += 2;
              continue;
            default: {
              let m = e.codePointAt(B + 1);
              if (m >= 48 && m <= 57 || m >= 65 && m <= 90 || m >= 97 && m <= 122) {
                let R = W.charCount(m);
                n += e.substring(B + 1, B + 1 + R), B += R + 1, s = !0;
              } else {
                n += "\\";
                let R = W.charCount(m);
                n += e.substring(B + 1, B + 1 + R), B += R + 1;
              }
              continue;
            }
          }
      } else if (c === "/") {
        n += "\\/", B += 1, s = !0;
        continue;
      } else if (c === "[") o = !0;
      else if (c === "]") o = !1;
      else if (!o && c === "(" && B + 2 < i && e[B + 1] === "?" && e[B + 2] === "<" && B + 3 < i && !"=!>)".includes(e[B + 3])) {
        n += "(?P<", B += 3, s = !0;
        continue;
      }
      let C = e.codePointAt(B), f = W.charCount(C);
      n += e.substring(B, B + f), B += f;
    }
    const u = s ? n : e;
    return t.length > 0 ? `(?${t})${u}` : u;
  }
}, Se, gB = (Se = class {
  /**
  * Returns a literal pattern string for the specified string.
  *
  * This method produces a string that can be used to create a <code>RE2JS</code> that would
  * match the string <code>s</code> as if it were a literal pattern.
  *
  * Metacharacters or escape sequences in the input sequence will be given no special meaning.
  *
  * @param {string} str The string to be literalized
  * @returns {string} A literal string replacement
  */
  static quote(e) {
    return W.quoteMeta(e);
  }
  /**
  * Quotes '\' and '$' in {@code str}, so that the returned string could be used in
  * replacement methods as a literal replacement of {@code str}.
  *
  * This is a convenience delegation to {@link Matcher.quoteReplacement}.
  *
  * @param {string} str the string to be quoted
  * @param {boolean} [javaMode=false] whether the replacement will be used in javaMode
  * @returns {string} the quoted string
  */
  static quoteReplacement(e, t = !1) {
    return qc.quoteReplacement(e, t);
  }
  /**
  * Translates a given regular expression string to ensure compatibility with RE2JS.
  *
  * This function preprocesses the input regex string by applying necessary transformations,
  * such as escaping special characters (e.g., `/`), converting named capture groups to
  * RE2JS-compatible syntax, and handling Unicode sequences properly. It ensures that the
  * resulting regex is safe and properly formatted before compilation.
  *
  * @param {string|RegExp} expr - The regular expression string to be translated.
  * @returns {string} - The transformed regular expression string, ready for compilation.
  */
  static translateRegExp(e) {
    return o_.translate(e);
  }
  /**
  * Helper: create new RE2JS with given regex and flags. Flregex is the regex with flags applied.
  * @param {string} regex
  * @param {number} [flags=0]
  * @returns {RE2JS}
  */
  static compile(e, t = 0) {
    let n = e;
    if ((t & Se.CASE_INSENSITIVE) !== 0 && (n = `(?i)${n}`), (t & Se.DOTALL) !== 0 && (n = `(?s)${n}`), (t & Se.MULTILINE) !== 0 && (n = `(?m)${n}`), (t & -544) !== 0) throw new ME("Flags should only be a combination of MULTILINE, DOTALL, CASE_INSENSITIVE, DISABLE_UNICODE_GROUPS, LONGEST_MATCH, LOOKBEHINDS");
    let s = V.PERL;
    (t & Se.DISABLE_UNICODE_GROUPS) !== 0 && (s &= -129), (t & Se.LOOKBEHINDS) !== 0 && (s |= V.LOOKBEHIND);
    const i = new Se(e, t);
    return i.re2Input = i_.compileImpl(n, s, (t & Se.LONGEST_MATCH) !== 0), i;
  }
  /**
  * Matches a string against a regular expression.
  *
  * @param {string} regex the regular expression
  * @param {string|number[]|Uint8Array} input the input
  * @returns {boolean} true if the regular expression matches the entire input
  * @throws RE2JSSyntaxException if the regular expression is malformed
  */
  static matches(e, t) {
    return Se.compile(e).testExact(t);
  }
  /**
  * This is visible for testing.
  * @private
  */
  static initTest(e, t, n) {
    if (e == null) throw new Error("pattern is null");
    if (n == null) throw new Error("re2 is null");
    const s = new Se(e, t);
    return s.re2Input = n, s;
  }
  /**
  *
  * @param {string} pattern
  * @param {number} flags
  */
  constructor(e, t) {
    this.patternInput = e, this.flagsInput = t, this.re2Input = null;
  }
  /**
  * Releases memory used by internal caches associated with this pattern. Does not change the
  * observable behaviour. Useful for tests that detect memory leaks via allocation tracking.
  */
  reset() {
    this.re2Input.reset();
  }
  /**
  * Returns the flags used in the constructor.
  * @returns {number}
  */
  flags() {
    return this.flagsInput;
  }
  /**
  * Returns the pattern used in the constructor.
  * @returns {string}
  */
  pattern() {
    return this.patternInput;
  }
  re2() {
    return this.re2Input;
  }
  /**
  * Matches a string against a regular expression.
  *
  * @param {string|number[]|Uint8Array} input the input
  * @returns {boolean} true if the regular expression matches the entire input
  */
  matches(e) {
    return this.testExact(e);
  }
  /**
  * Creates a new {@code Matcher} matching the pattern against the input.
  *
  * @param {string|number[]|Uint8Array|MatcherInputBase} input the input string
  * @returns {Matcher}
  */
  matcher(e) {
    return W.isByteArray(e) && (e = Kn.utf8(e)), new qc(this, e);
  }
  /**
  * Tests whether the regular expression matches any part of the input string.
  * Performance Note: This method is highly optimized. Because it only returns
  * a boolean and does not extract capture groups, it bypasses the `Matcher` overhead
  * and guarantees execution on the high-speed DFA engine whenever possible.
  *
  * @param {string|number[]|Uint8Array} input - The input string or UTF-8 byte array to test against.
  * @returns {boolean} `true` if the pattern is found anywhere in the input, `false` otherwise.
  */
  test(e) {
    return W.isByteArray(e) ? this.re2Input.matchUTF8(e) : this.re2Input.match(e);
  }
  /**
  * Tests whether the regular expression matches the ENTIRE input string.
  * * **Performance Note:** This operates identically to `.matches()`, but is significantly
  * faster because it does not request capture group data. By requesting 0 capture groups,
  * it securely routes execution through the DFA fast-path.
  *
  * @param {string|number[]|Uint8Array} input - The input string or UTF-8 byte array to test against.
  * @returns {boolean} `true` if the exact input string fully matches the pattern, `false` otherwise.
  */
  testExact(e) {
    const t = W.isByteArray(e) ? me.fromUTF8(e) : me.fromUTF16(e);
    return this.re2Input.executeEngine(t, 0, V.ANCHOR_BOTH, 0) !== null;
  }
  /**
  * Executes a search for a match in a specified string.
  * Returns a result array, or null if no match is found.
  * The returned array perfectly mirrors standard JavaScript `RegExpExecArray`,
  * including `.index`, `.input`, and `.groups` properties.
  *
  * @param {string|number[]|Uint8Array} input the input string or byte array
  * @returns {Array|null} the match array with index, input, and groups properties, or null
  */
  exec(e) {
    const t = this.matcher(e);
    if (!t.find()) return null;
    const n = [t.group(0)];
    for (let i = 1; i <= t.groupCount(); i++) {
      const o = t.group(i);
      n.push(o === null ? void 0 : o);
    }
    n.index = t.start(0), n.input = e;
    const s = this.namedGroups();
    if (Object.keys(s).length > 0) {
      const i = t.getNamedGroups();
      for (const o in i) i[o] === null && (i[o] = void 0);
      n.groups = i;
    } else n.groups = void 0;
    return n;
  }
  /**
  * Splits input around instances of the regular expression. It returns an array giving the strings
  * that occur before, between, and after instances of the regular expression.
  *
  * If {@code limit <= 0}, there is no limit on the size of the returned array. If
  * {@code limit == 0}, empty strings that would occur at the end of the array are omitted. If
  * {@code limit > 0}, at most limit strings are returned. The final string contains the remainder
  * of the input, possibly including additional matches of the pattern.
  *
  * @param {string} input the input string to be split
  * @param {number} [limit=0] the limit
  * @returns {string[]} the split strings
  */
  split(e, t = 0) {
    const n = this.matcher(e), s = [];
    let i = 0, o = 0;
    for (; n.find(); ) {
      if (o === 0 && n.end() === 0) {
        o = n.end();
        continue;
      }
      if (t > 0 && s.length === t - 1) break;
      if (o === n.start()) {
        if (t === 0) {
          i += 1, o = n.end();
          continue;
        }
      } else for (; i > 0; )
        s.push(""), i -= 1;
      s.push(n.substring(o, n.start())), o = n.end();
    }
    if (t === 0 && o !== n.inputLength()) {
      for (; i > 0; )
        s.push(""), i -= 1;
      s.push(n.substring(o, n.inputLength()));
    }
    return (t !== 0 || s.length === 0 && !(o === n.inputLength() && o > 0)) && s.push(n.substring(o, n.inputLength())), s;
  }
  /**
  * Returns an iterator of all results matching a string against the regular expression,
  * including capturing groups.
  *
  * @param {string|number[]|Uint8Array} input the input string or byte array
  * @returns {IterableIterator<RegExpMatchArray>}
  */
  *matchAll(e) {
    const t = this.matcher(e);
    for (; t.find(); ) {
      const n = [t.group(0)];
      for (let i = 1; i <= t.groupCount(); i++) {
        const o = t.group(i);
        n.push(o === null ? void 0 : o);
      }
      n.index = t.start(0), n.input = e;
      const s = this.namedGroups();
      if (Object.keys(s).length > 0) {
        const i = t.getNamedGroups();
        for (const o in i) i[o] === null && (i[o] = void 0);
        n.groups = i;
      } else n.groups = void 0;
      yield n;
    }
  }
  /**
  *
  * @returns {string}
  */
  toString() {
    return this.patternInput;
  }
  /**
  * Returns the program size of this pattern.
  *
  * <p>
  * Similar to the C++ implementation, the program size is a very approximate measure of a regexp's
  * "cost". Larger numbers are more expensive than smaller numbers.
  * </p>
  *
  * @returns {number} the program size of this pattern
  */
  programSize() {
    return this.re2Input.numberOfInstructions();
  }
  /**
  * Returns the number of capturing groups in this matcher's pattern. Group zero denotes the entire
  * pattern and is excluded from this count.
  *
  * @returns {number} the number of capturing groups in this pattern
  */
  groupCount() {
    return this.re2Input.numberOfCapturingGroups();
  }
  /**
  * Return a map of the capturing groups in this matcher's pattern, where key is the name and value
  * is the index of the group in the pattern.
  * @returns {Record<string, number>}
  */
  namedGroups() {
    return this.re2Input.namedGroups;
  }
  /**
  *
  * @param {*} other
  * @returns {boolean}
  */
  equals(e) {
    return this === e ? !0 : e === null || this.constructor !== e.constructor ? !1 : this.flagsInput === e.flagsInput && this.patternInput === e.patternInput;
  }
}, /**
* Flag: case insensitive matching.
*/
M(Se, "CASE_INSENSITIVE", cr.CASE_INSENSITIVE), /**
* Flag: dot ({@code .}) matches all characters, including newline.
*/
M(Se, "DOTALL", cr.DOTALL), /**
* Flag: multiline matching: {@code ^} and {@code $} match at beginning and end of line, not just
* beginning and end of input.
*/
M(Se, "MULTILINE", cr.MULTILINE), /**
* Flag: Unicode groups (e.g. {@code \p\ Greek\} ) will be syntax errors.
*/
M(Se, "DISABLE_UNICODE_GROUPS", cr.DISABLE_UNICODE_GROUPS), /**
* Flag: matches longest possible string.
*/
M(Se, "LONGEST_MATCH", cr.LONGEST_MATCH), /**
* Flag: enable linear-time captureless lookbehinds.
*/
M(Se, "LOOKBEHINDS", cr.LOOKBEHINDS), Se);
let xr = "12.18.0";
function a_(r) {
  xr = r;
}
const tr = new iB("@firebase/firestore");
function Cr() {
  return tr.logLevel;
}
function q(r, ...e) {
  if (tr.logLevel <= ae.DEBUG) {
    const t = e.map(mB);
    tr.debug(`Firestore (${xr}): ${r}`, ...t);
  }
}
function Qt(r, ...e) {
  if (tr.logLevel <= ae.ERROR) {
    const t = e.map(mB);
    tr.error(`Firestore (${xr}): ${r}`, ...t);
  }
}
function Tt(r, ...e) {
  if (tr.logLevel <= ae.WARN) {
    const t = e.map(mB);
    tr.warn(`Firestore (${xr}): ${r}`, ...t);
  }
}
function mB(r) {
  if (typeof r == "string") return r;
  try {
    return (function(t) {
      return JSON.stringify(t);
    })(r);
  } catch {
    return r;
  }
}
function $(r, e, t) {
  let n = "Unexpected state";
  typeof e == "string" ? n = e : t = e, EC(r, n, t);
}
function EC(r, e, t) {
  let n = `FIRESTORE (${xr}) INTERNAL ASSERTION FAILED: ${e} (ID: ${r.toString(16)})`;
  if (t !== void 0) try {
    n += " CONTEXT: " + JSON.stringify(t);
  } catch {
    n += " CONTEXT: " + t;
  }
  throw Qt(n), new Error(n);
}
function Q(r, e, t, n) {
  let s = "Unexpected state";
  typeof t == "string" ? s = t : n = t, r || EC(e, s, n);
}
function ne(r, e) {
  return r;
}
function B_(r) {
  const e = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof self < "u" && (self.crypto || self.msCrypto)
  ), t = new Uint8Array(r);
  if (e && typeof e.getRandomValues == "function") e.getRandomValues(t);
  else
    for (let n = 0; n < r; n++) t[n] = Math.floor(256 * Math.random());
  return t;
}
class EB {
  static newId() {
    const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", t = 62 * Math.floor(4.129032258064516);
    let n = "";
    for (; n.length < 20; ) {
      const s = B_(40);
      for (let i = 0; i < s.length; ++i)
        n.length < 20 && s[i] < t && (n += e.charAt(s[i] % 62));
    }
    return n;
  }
}
function oe(r, e) {
  return r < e ? -1 : r > e ? 1 : 0;
}
function Ua(r, e) {
  const t = Math.min(r.length, e.length);
  for (let n = 0; n < t; n++) {
    const s = r.charAt(n), i = e.charAt(n);
    if (s !== i) return ya(s) === ya(i) ? oe(s, i) : ya(s) ? 1 : -1;
  }
  return oe(r.length, e.length);
}
const u_ = 55296, c_ = 57343;
function ya(r) {
  const e = r.charCodeAt(0);
  return e >= u_ && e <= c_;
}
function Rr(r, e, t) {
  return r.length === e.length && r.every(((n, s) => t(n, e[s])));
}
class Ie {
  constructor(e, t) {
    this.comparator = e, this.root = t || Ue.EMPTY;
  }
  // Returns a copy of the map, with the specified key/value added or replaced.
  insert(e, t) {
    return new Ie(this.comparator, this.root.insert(e, t, this.comparator).copy(null, null, Ue.BLACK, null, null));
  }
  // Returns a copy of the map, with the specified key removed.
  remove(e) {
    return new Ie(this.comparator, this.root.remove(e, this.comparator).copy(null, null, Ue.BLACK, null, null));
  }
  // Returns the value of the node with the given key, or null.
  get(e) {
    let t = this.root;
    for (; !t.isEmpty(); ) {
      const n = this.comparator(e, t.key);
      if (n === 0) return t.value;
      n < 0 ? t = t.left : n > 0 && (t = t.right);
    }
    return null;
  }
  // Returns the index of the element in this sorted map, or -1 if it doesn't
  // exist.
  indexOf(e) {
    let t = 0, n = this.root;
    for (; !n.isEmpty(); ) {
      const s = this.comparator(e, n.key);
      if (s === 0) return t + n.left.size;
      s < 0 ? n = n.left : (
        // Count all nodes left of the node plus the node itself
        (t += n.left.size + 1, n = n.right)
      );
    }
    return -1;
  }
  isEmpty() {
    return this.root.isEmpty();
  }
  // Returns the total number of nodes in the map.
  get size() {
    return this.root.size;
  }
  // Returns the minimum key in the map.
  minKey() {
    return this.root.minKey();
  }
  // Returns the maximum key in the map.
  maxKey() {
    return this.root.maxKey();
  }
  // Traverses the map in key order and calls the specified action function
  // for each key/value pair. If action returns true, traversal is aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  inorderTraversal(e) {
    return this.root.inorderTraversal(e);
  }
  forEach(e) {
    this.inorderTraversal(((t, n) => (e(t, n), !1)));
  }
  toString() {
    const e = [];
    return this.inorderTraversal(((t, n) => (e.push(`${t}:${n}`), !1))), `{${e.join(", ")}}`;
  }
  // Traverses the map in reverse key order and calls the specified action
  // function for each key/value pair. If action returns true, traversal is
  // aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  reverseTraversal(e) {
    return this.root.reverseTraversal(e);
  }
  // Returns an iterator over the SortedMap.
  getIterator() {
    return new Fi(this.root, null, this.comparator, !1);
  }
  getIteratorFrom(e) {
    return new Fi(this.root, e, this.comparator, !1);
  }
  getReverseIterator() {
    return new Fi(this.root, null, this.comparator, !0);
  }
  getReverseIteratorFrom(e) {
    return new Fi(this.root, e, this.comparator, !0);
  }
}
class Fi {
  constructor(e, t, n, s) {
    this.isReverse = s, this.nodeStack = [];
    let i = 1;
    for (; !e.isEmpty(); ) if (i = t ? n(e.key, t) : 1, // flip the comparison if we're going in reverse
    t && s && (i *= -1), i < 0)
      e = this.isReverse ? e.left : e.right;
    else {
      if (i === 0) {
        this.nodeStack.push(e);
        break;
      }
      this.nodeStack.push(e), e = this.isReverse ? e.right : e.left;
    }
  }
  getNext() {
    let e = this.nodeStack.pop();
    const t = {
      key: e.key,
      value: e.value
    };
    if (this.isReverse) for (e = e.left; !e.isEmpty(); ) this.nodeStack.push(e), e = e.right;
    else for (e = e.right; !e.isEmpty(); ) this.nodeStack.push(e), e = e.left;
    return t;
  }
  hasNext() {
    return this.nodeStack.length > 0;
  }
  peek() {
    if (this.nodeStack.length === 0) return null;
    const e = this.nodeStack[this.nodeStack.length - 1];
    return {
      key: e.key,
      value: e.value
    };
  }
}
class Ue {
  constructor(e, t, n, s, i) {
    this.key = e, this.value = t, this.color = n ?? Ue.RED, this.left = s ?? Ue.EMPTY, this.right = i ?? Ue.EMPTY, this.size = this.left.size + 1 + this.right.size;
  }
  // Returns a copy of the current node, optionally replacing pieces of it.
  copy(e, t, n, s, i) {
    return new Ue(e ?? this.key, t ?? this.value, n ?? this.color, s ?? this.left, i ?? this.right);
  }
  isEmpty() {
    return !1;
  }
  // Traverses the tree in key order and calls the specified action function
  // for each node. If action returns true, traversal is aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  inorderTraversal(e) {
    return this.left.inorderTraversal(e) || e(this.key, this.value) || this.right.inorderTraversal(e);
  }
  // Traverses the tree in reverse key order and calls the specified action
  // function for each node. If action returns true, traversal is aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  reverseTraversal(e) {
    return this.right.reverseTraversal(e) || e(this.key, this.value) || this.left.reverseTraversal(e);
  }
  // Returns the minimum node in the tree.
  min() {
    return this.left.isEmpty() ? this : this.left.min();
  }
  // Returns the maximum key in the tree.
  minKey() {
    return this.min().key;
  }
  // Returns the maximum key in the tree.
  maxKey() {
    return this.right.isEmpty() ? this.key : this.right.maxKey();
  }
  // Returns new tree, with the key/value added.
  insert(e, t, n) {
    let s = this;
    const i = n(e, s.key);
    return s = i < 0 ? s.copy(null, null, null, s.left.insert(e, t, n), null) : i === 0 ? s.copy(null, t, null, null, null) : s.copy(null, null, null, null, s.right.insert(e, t, n)), s.fixUp();
  }
  removeMin() {
    if (this.left.isEmpty()) return Ue.EMPTY;
    let e = this;
    return e.left.isRed() || e.left.left.isRed() || (e = e.moveRedLeft()), e = e.copy(null, null, null, e.left.removeMin(), null), e.fixUp();
  }
  // Returns new tree, with the specified item removed.
  remove(e, t) {
    let n, s = this;
    if (t(e, s.key) < 0) s.left.isEmpty() || s.left.isRed() || s.left.left.isRed() || (s = s.moveRedLeft()), s = s.copy(null, null, null, s.left.remove(e, t), null);
    else {
      if (s.left.isRed() && (s = s.rotateRight()), s.right.isEmpty() || s.right.isRed() || s.right.left.isRed() || (s = s.moveRedRight()), t(e, s.key) === 0) {
        if (s.right.isEmpty()) return Ue.EMPTY;
        n = s.right.min(), s = s.copy(n.key, n.value, null, null, s.right.removeMin());
      }
      s = s.copy(null, null, null, null, s.right.remove(e, t));
    }
    return s.fixUp();
  }
  isRed() {
    return this.color;
  }
  // Returns new tree after performing any needed rotations.
  fixUp() {
    let e = this;
    return e.right.isRed() && !e.left.isRed() && (e = e.rotateLeft()), e.left.isRed() && e.left.left.isRed() && (e = e.rotateRight()), e.left.isRed() && e.right.isRed() && (e = e.colorFlip()), e;
  }
  moveRedLeft() {
    let e = this.colorFlip();
    return e.right.left.isRed() && (e = e.copy(null, null, null, null, e.right.rotateRight()), e = e.rotateLeft(), e = e.colorFlip()), e;
  }
  moveRedRight() {
    let e = this.colorFlip();
    return e.left.left.isRed() && (e = e.rotateRight(), e = e.colorFlip()), e;
  }
  rotateLeft() {
    const e = this.copy(null, null, Ue.RED, null, this.right.left);
    return this.right.copy(null, null, this.color, e, null);
  }
  rotateRight() {
    const e = this.copy(null, null, Ue.RED, this.left.right, null);
    return this.left.copy(null, null, this.color, null, e);
  }
  colorFlip() {
    const e = this.left.copy(null, null, !this.left.color, null, null), t = this.right.copy(null, null, !this.right.color, null, null);
    return this.copy(null, null, !this.color, e, t);
  }
  // For testing.
  checkMaxDepth() {
    const e = this.check();
    return Math.pow(2, e) <= this.size + 1;
  }
  // In a balanced RB tree, the black-depth (number of black nodes) from root to
  // leaves is equal on both sides.  This function verifies that or asserts.
  check() {
    if (this.isRed() && this.left.isRed()) throw $(43730, {
      key: this.key,
      value: this.value
    });
    if (this.right.isRed()) throw $(14113, {
      key: this.key,
      value: this.value
    });
    const e = this.left.check();
    if (e !== this.right.check()) throw $(27949);
    return e + (this.isRed() ? 0 : 1);
  }
}
Ue.EMPTY = null, Ue.RED = !0, Ue.BLACK = !1;
Ue.EMPTY = new // Represents an empty node (a leaf node in the Red-Black Tree).
class {
  constructor() {
    this.size = 0;
  }
  get key() {
    throw $(57766);
  }
  get value() {
    throw $(16141);
  }
  get color() {
    throw $(16727);
  }
  get left() {
    throw $(29726);
  }
  get right() {
    throw $(36894);
  }
  // Returns a copy of the current node.
  copy(e, t, n, s, i) {
    return this;
  }
  // Returns a copy of the tree, with the specified key/value added.
  insert(e, t, n) {
    return new Ue(e, t);
  }
  // Returns a copy of the tree, with the specified key removed.
  remove(e, t) {
    return this;
  }
  isEmpty() {
    return !0;
  }
  inorderTraversal(e) {
    return !1;
  }
  reverseTraversal(e) {
    return !1;
  }
  minKey() {
    return null;
  }
  maxKey() {
    return null;
  }
  isRed() {
    return !1;
  }
  // For testing.
  checkMaxDepth() {
    return !0;
  }
  check() {
    return 0;
  }
}();
class Ne {
  constructor(e) {
    this.comparator = e, this.data = new Ie(this.comparator);
  }
  has(e) {
    return this.data.get(e) !== null;
  }
  first() {
    return this.data.minKey();
  }
  last() {
    return this.data.maxKey();
  }
  get size() {
    return this.data.size;
  }
  indexOf(e) {
    return this.data.indexOf(e);
  }
  /** Iterates elements in order defined by "comparator" */
  forEach(e) {
    this.data.inorderTraversal(((t, n) => (e(t), !1)));
  }
  /** Iterates over `elem`s such that: range[0] &lt;= elem &lt; range[1]. */
  forEachInRange(e, t) {
    const n = this.data.getIteratorFrom(e[0]);
    for (; n.hasNext(); ) {
      const s = n.getNext();
      if (this.comparator(s.key, e[1]) >= 0) return;
      t(s.key);
    }
  }
  /**
   * Iterates over `elem`s such that: start &lt;= elem until false is returned.
   */
  forEachWhile(e, t) {
    let n;
    for (n = t !== void 0 ? this.data.getIteratorFrom(t) : this.data.getIterator(); n.hasNext(); )
      if (!e(n.getNext().key)) return;
  }
  /** Finds the least element greater than or equal to `elem`. */
  firstAfterOrEqual(e) {
    const t = this.data.getIteratorFrom(e);
    return t.hasNext() ? t.getNext().key : null;
  }
  getIterator() {
    return new pl(this.data.getIterator());
  }
  getIteratorFrom(e) {
    return new pl(this.data.getIteratorFrom(e));
  }
  /** Inserts or updates an element */
  add(e) {
    return this.copy(this.data.remove(e).insert(e, !0));
  }
  /** Deletes an element */
  delete(e) {
    return this.has(e) ? this.copy(this.data.remove(e)) : this;
  }
  isEmpty() {
    return this.data.isEmpty();
  }
  unionWith(e) {
    let t = this;
    return t.size < e.size && (t = e, e = this), e.forEach(((n) => {
      t = t.add(n);
    })), t;
  }
  isEqual(e) {
    if (!(e instanceof Ne) || this.size !== e.size) return !1;
    const t = this.data.getIterator(), n = e.data.getIterator();
    for (; t.hasNext(); ) {
      const s = t.getNext().key, i = n.getNext().key;
      if (this.comparator(s, i) !== 0) return !1;
    }
    return !0;
  }
  toArray() {
    const e = [];
    return this.forEach(((t) => {
      e.push(t);
    })), e;
  }
  toString() {
    const e = [];
    return this.forEach(((t) => e.push(t))), "SortedSet(" + e.toString() + ")";
  }
  copy(e) {
    const t = new Ne(this.comparator);
    return t.data = e, t;
  }
}
class pl {
  constructor(e) {
    this.iter = e;
  }
  getNext() {
    return this.iter.getNext().key;
  }
  hasNext() {
    return this.iter.hasNext();
  }
}
const L = {
  // Causes are copied from:
  // https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
  /** Not an error; returned on success. */
  OK: "ok",
  /** The operation was cancelled (typically by the caller). */
  CANCELLED: "cancelled",
  /** Unknown error or an error from a different error domain. */
  UNKNOWN: "unknown",
  /**
   * Client specified an invalid argument. Note that this differs from
   * FAILED_PRECONDITION. INVALID_ARGUMENT indicates arguments that are
   * problematic regardless of the state of the system (e.g., a malformed file
   * name).
   */
  INVALID_ARGUMENT: "invalid-argument",
  /**
   * Deadline expired before operation could complete. For operations that
   * change the state of the system, this error may be returned even if the
   * operation has completed successfully. For example, a successful response
   * from a server could have been delayed long enough for the deadline to
   * expire.
   */
  DEADLINE_EXCEEDED: "deadline-exceeded",
  /** Some requested entity (e.g., file or directory) was not found. */
  NOT_FOUND: "not-found",
  /**
   * Some entity that we attempted to create (e.g., file or directory) already
   * exists.
   */
  ALREADY_EXISTS: "already-exists",
  /**
   * The caller does not have permission to execute the specified operation.
   * PERMISSION_DENIED must not be used for rejections caused by exhausting
   * some resource (use RESOURCE_EXHAUSTED instead for those errors).
   * PERMISSION_DENIED must not be used if the caller cannot be identified
   * (use UNAUTHENTICATED instead for those errors).
   */
  PERMISSION_DENIED: "permission-denied",
  /**
   * The request does not have valid authentication credentials for the
   * operation.
   */
  UNAUTHENTICATED: "unauthenticated",
  /**
   * Some resource has been exhausted, perhaps a per-user quota, or perhaps the
   * entire file system is out of space.
   */
  RESOURCE_EXHAUSTED: "resource-exhausted",
  /**
   * Operation was rejected because the system is not in a state required for
   * the operation's execution. For example, directory to be deleted may be
   * non-empty, an rmdir operation is applied to a non-directory, etc.
   *
   * A litmus test that may help a service implementor in deciding
   * between FAILED_PRECONDITION, ABORTED, and UNAVAILABLE:
   *  (a) Use UNAVAILABLE if the client can retry just the failing call.
   *  (b) Use ABORTED if the client should retry at a higher-level
   *      (e.g., restarting a read-modify-write sequence).
   *  (c) Use FAILED_PRECONDITION if the client should not retry until
   *      the system state has been explicitly fixed. E.g., if an "rmdir"
   *      fails because the directory is non-empty, FAILED_PRECONDITION
   *      should be returned since the client should not retry unless
   *      they have first fixed up the directory by deleting files from it.
   *  (d) Use FAILED_PRECONDITION if the client performs conditional
   *      REST Get/Update/Delete on a resource and the resource on the
   *      server does not match the condition. E.g., conflicting
   *      read-modify-write on the same resource.
   */
  FAILED_PRECONDITION: "failed-precondition",
  /**
   * The operation was aborted, typically due to a concurrency issue like
   * sequencer check failures, transaction aborts, etc.
   *
   * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
   * and UNAVAILABLE.
   */
  ABORTED: "aborted",
  /**
   * Operation was attempted past the valid range. E.g., seeking or reading
   * past end of file.
   *
   * Unlike INVALID_ARGUMENT, this error indicates a problem that may be fixed
   * if the system state changes. For example, a 32-bit file system will
   * generate INVALID_ARGUMENT if asked to read at an offset that is not in the
   * range [0,2^32-1], but it will generate OUT_OF_RANGE if asked to read from
   * an offset past the current file size.
   *
   * There is a fair bit of overlap between FAILED_PRECONDITION and
   * OUT_OF_RANGE. We recommend using OUT_OF_RANGE (the more specific error)
   * when it applies so that callers who are iterating through a space can
   * easily look for an OUT_OF_RANGE error to detect when they are done.
   */
  OUT_OF_RANGE: "out-of-range",
  /** Operation is not implemented or not supported/enabled in this service. */
  UNIMPLEMENTED: "unimplemented",
  /**
   * Internal errors. Means some invariants expected by underlying System has
   * been broken. If you see one of these errors, Something is very broken.
   */
  INTERNAL: "internal",
  /**
   * The service is currently unavailable. This is a most likely a transient
   * condition and may be corrected by retrying with a backoff.
   *
   * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
   * and UNAVAILABLE.
   */
  UNAVAILABLE: "unavailable",
  /** Unrecoverable data loss or corruption. */
  DATA_LOSS: "data-loss"
};
class j extends $t {
  /** @hideconstructor */
  constructor(e, t) {
    super(e, t), this.code = e, this.message = t, // HACK: We write a toString property directly because Error is not a real
    // class and so inheritance does not work correctly. We could alternatively
    // do the same "back-door inheritance" trick that FirebaseError does.
    this.toString = () => `${this.name}: [code=${this.code}]: ${this.message}`;
  }
}
const vr = "__name__";
class Pt {
  constructor(e, t, n) {
    t === void 0 ? t = 0 : t > e.length && $(637, {
      offset: t,
      range: e.length
    }), n === void 0 ? n = e.length - t : n > e.length - t && $(1746, {
      length: n,
      range: e.length - t
    }), this.segments = e, this.offset = t, this.len = n;
  }
  get length() {
    return this.len;
  }
  isEqual(e) {
    return Pt.comparator(this, e) === 0;
  }
  child(e) {
    const t = this.segments.slice(this.offset, this.limit());
    return e instanceof Pt ? e.forEach(((n) => {
      t.push(n);
    })) : t.push(e), this.construct(t);
  }
  /** The index of one past the last segment of the path. */
  limit() {
    return this.offset + this.length;
  }
  popFirst(e) {
    return e = e === void 0 ? 1 : e, this.construct(this.segments, this.offset + e, this.length - e);
  }
  popLast() {
    return this.construct(this.segments, this.offset, this.length - 1);
  }
  firstSegment() {
    return this.segments[this.offset];
  }
  lastSegment() {
    return this.get(this.length - 1);
  }
  get(e) {
    return this.segments[this.offset + e];
  }
  isEmpty() {
    return this.length === 0;
  }
  isPrefixOf(e) {
    if (e.length < this.length) return !1;
    for (let t = 0; t < this.length; t++) if (this.get(t) !== e.get(t)) return !1;
    return !0;
  }
  isImmediateParentOf(e) {
    if (this.length + 1 !== e.length) return !1;
    for (let t = 0; t < this.length; t++) if (this.get(t) !== e.get(t)) return !1;
    return !0;
  }
  forEach(e) {
    for (let t = this.offset, n = this.limit(); t < n; t++) e(this.segments[t]);
  }
  toArray() {
    return this.segments.slice(this.offset, this.limit());
  }
  /**
   * Compare 2 paths segment by segment, prioritizing numeric IDs
   * (e.g., "__id123__") in numeric ascending order, followed by string
   * segments in lexicographical order.
   */
  static comparator(e, t) {
    const n = Math.min(e.length, t.length);
    for (let s = 0; s < n; s++) {
      const i = Pt.compareSegments(e.get(s), t.get(s));
      if (i !== 0) return i;
    }
    return oe(e.length, t.length);
  }
  static compareSegments(e, t) {
    const n = Pt.isNumericId(e), s = Pt.isNumericId(t);
    return n && !s ? -1 : !n && s ? 1 : n && s ? Pt.extractNumericId(e).compare(Pt.extractNumericId(t)) : Ua(e, t);
  }
  // Checks if a segment is a numeric ID (starts with "__id" and ends with "__").
  static isNumericId(e) {
    return e.startsWith("__id") && e.endsWith("__");
  }
  static extractNumericId(e) {
    return mn.fromString(e.substring(4, e.length - 2));
  }
}
class he extends Pt {
  construct(e, t, n) {
    return new he(e, t, n);
  }
  canonicalString() {
    return this.toArray().join("/");
  }
  toString() {
    return this.canonicalString();
  }
  toStringWithLeadingSlash() {
    return `/${this.canonicalString()}`;
  }
  /**
   * Returns a string representation of this path
   * where each path segment has been encoded with
   * `encodeURIComponent`.
   */
  toUriEncodedString() {
    return this.toArray().map(encodeURIComponent).join("/");
  }
  /**
   * Creates a resource path from the given slash-delimited string. If multiple
   * arguments are provided, all components are combined. Leading and trailing
   * slashes from all components are ignored.
   */
  static fromString(...e) {
    const t = [];
    for (const n of e) {
      if (n.indexOf("//") >= 0) throw new j(L.INVALID_ARGUMENT, `Invalid segment (${n}). Paths must not contain // in them.`);
      t.push(...n.split("/").filter(((s) => s.length > 0)));
    }
    return new he(t);
  }
  static emptyPath() {
    return new he([]);
  }
}
const l_ = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
let gt = class fr extends Pt {
  construct(e, t, n) {
    return new fr(e, t, n);
  }
  /**
   * Returns true if the string could be used as a segment in a field path
   * without escaping.
   */
  static isValidIdentifier(e) {
    return l_.test(e);
  }
  canonicalString() {
    return this.toArray().map(((e) => (e = e.replace(/\\/g, "\\\\").replace(/`/g, "\\`"), fr.isValidIdentifier(e) || (e = "`" + e + "`"), e))).join(".");
  }
  toString() {
    return this.canonicalString();
  }
  /**
   * Returns true if this field references the key of a document.
   */
  isKeyField() {
    return this.length === 1 && this.get(0) === vr;
  }
  /**
   * The field designating the key of a document.
   */
  static keyField() {
    return new fr([vr]);
  }
  /**
   * Parses a field string from the given server-formatted string.
   *
   * - Splitting the empty string is not allowed (for now at least).
   * - Empty segments within the string (e.g. if there are two consecutive
   *   separators) are not allowed.
   *
   * TODO(b/37244157): we should make this more strict. Right now, it allows
   * non-identifier path components, even if they aren't escaped.
   */
  static fromServerFormat(e) {
    const t = [];
    let n = "", s = 0;
    const i = () => {
      if (n.length === 0) throw new j(L.INVALID_ARGUMENT, `Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);
      t.push(n), n = "";
    };
    let o = !1;
    for (; s < e.length; ) {
      const B = e[s];
      if (B === "\\") {
        if (s + 1 === e.length) throw new j(L.INVALID_ARGUMENT, "Path has trailing escape character: " + e);
        const u = e[s + 1];
        if (u !== "\\" && u !== "." && u !== "`") throw new j(L.INVALID_ARGUMENT, "Path has invalid escape sequence: " + e);
        n += u, s += 2;
      } else B === "`" ? (o = !o, s++) : B !== "." || o ? (n += B, s++) : (i(), s++);
    }
    if (i(), o) throw new j(L.INVALID_ARGUMENT, "Unterminated ` in path: " + e);
    return new fr(t);
  }
  static emptyPath() {
    return new fr([]);
  }
};
class dt {
  constructor(e) {
    this.fields = e, // TODO(dimond): validation of FieldMask
    // Sort the field mask to support `FieldMask.isEqual()` and assert below.
    e.sort(gt.comparator);
  }
  static empty() {
    return new dt([]);
  }
  /**
   * Returns a new FieldMask object that is the result of adding all the given
   * fields paths to this field mask.
   */
  unionWith(e) {
    let t = new Ne(gt.comparator);
    for (const n of this.fields) t = t.add(n);
    for (const n of e) t = t.add(n);
    return new dt(t.toArray());
  }
  /**
   * Verifies that `fieldPath` is included by at least one field in this field
   * mask.
   *
   * This is an O(n) operation, where `n` is the size of the field mask.
   */
  covers(e) {
    for (const t of this.fields) if (t.isPrefixOf(e)) return !0;
    return !1;
  }
  isEqual(e) {
    return Rr(this.fields, e.fields, ((t, n) => t.isEqual(n)));
  }
}
function no(r) {
  let e = 0;
  for (const t in r) Object.prototype.hasOwnProperty.call(r, t) && e++;
  return e;
}
function Ln(r, e) {
  for (const t in r) Object.prototype.hasOwnProperty.call(r, t) && e(t, r[t]);
}
function h_(r, e) {
  const t = [];
  for (const n in r) Object.prototype.hasOwnProperty.call(r, n) && t.push(e(r[n], n, r));
  return t;
}
function _C(r) {
  for (const e in r) if (Object.prototype.hasOwnProperty.call(r, e)) return !1;
  return !0;
}
class Y {
  constructor(e) {
    this.path = e;
  }
  static fromPath(e) {
    return new Y(he.fromString(e));
  }
  static fromName(e) {
    return new Y(he.fromString(e).popFirst(5));
  }
  static empty() {
    return new Y(he.emptyPath());
  }
  get collectionGroup() {
    return this.path.popLast().lastSegment();
  }
  /** Returns true if the document is in the specified collectionId. */
  hasCollectionId(e) {
    return this.path.length >= 2 && this.path.get(this.path.length - 2) === e;
  }
  /** Returns the collection group (i.e. the name of the parent collection) for this key. */
  getCollectionGroup() {
    return this.path.get(this.path.length - 2);
  }
  /** Returns the fully qualified path to the parent collection. */
  getCollectionPath() {
    return this.path.popLast();
  }
  isEqual(e) {
    return e !== null && he.comparator(this.path, e.path) === 0;
  }
  toString() {
    return this.path.toString();
  }
  static comparator(e, t) {
    return he.comparator(e.path, t.path);
  }
  static isDocumentKey(e) {
    return e.length % 2 == 0;
  }
  /**
   * Creates and returns a new document key with the given segments.
   *
   * @param segments - The segments of the path to the document
   * @returns A new instance of DocumentKey
   */
  static fromSegments(e) {
    return new Y(new he(e.slice()));
  }
}
function DC(r, e, t) {
  if (!t) throw new j(L.INVALID_ARGUMENT, `Function ${r}() cannot be called with an empty ${e}.`);
}
function C_(r, e, t, n) {
  if (e === !0 && n === !0) throw new j(L.INVALID_ARGUMENT, `${r} and ${t} cannot be used together.`);
}
function gl(r) {
  if (!Y.isDocumentKey(r)) throw new j(L.INVALID_ARGUMENT, `Invalid document reference. Document references must have an even number of segments, but ${r} has ${r.length}.`);
}
function ml(r) {
  if (Y.isDocumentKey(r)) throw new j(L.INVALID_ARGUMENT, `Invalid collection reference. Collection references must have an odd number of segments, but ${r} has ${r.length}.`);
}
function Zs(r) {
  return typeof r == "object" && r !== null && (Object.getPrototypeOf(r) === Object.prototype || Object.getPrototypeOf(r) === null);
}
function yo(r) {
  if (r === void 0) return "undefined";
  if (r === null) return "null";
  if (typeof r == "string") return r.length > 20 && (r = `${r.substring(0, 20)}...`), JSON.stringify(r);
  if (typeof r == "number" || typeof r == "boolean") return "" + r;
  if (typeof r == "object") {
    if (r instanceof Array) return "an array";
    {
      const e = (
        /** try to get the constructor name for an object. */
        (function(n) {
          return n.constructor ? n.constructor.name : null;
        })(r)
      );
      return e ? `a custom ${e} object` : "an object";
    }
  }
  return typeof r == "function" ? "a function" : $(12329, {
    type: typeof r
  });
}
function jt(r, e) {
  if ("_delegate" in r && // Unwrap Compat types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (r = r._delegate), !(r instanceof e)) {
    if (e.name === r.constructor.name) throw new j(L.INVALID_ARGUMENT, "Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");
    {
      const t = yo(r);
      throw new j(L.INVALID_ARGUMENT, `Expected type '${e.name}', but it was: ${t}`);
    }
  }
  return r;
}
function be(r, e) {
  const t = {
    typeString: r
  };
  return e && (t.value = e), t;
}
function ei(r, e) {
  if (!Zs(r)) throw new j(L.INVALID_ARGUMENT, "JSON must be an object");
  let t;
  for (const n in e) if (e[n]) {
    const s = e[n].typeString, i = "value" in e[n] ? {
      value: e[n].value
    } : void 0;
    if (!(n in r)) {
      t = `JSON missing required field: '${n}'`;
      break;
    }
    const o = r[n];
    if (s && typeof o !== s) {
      t = `JSON field '${n}' must be a ${s}.`;
      break;
    }
    if (i !== void 0 && o !== i.value) {
      t = `Expected '${n}' field to equal '${i.value}'`;
      break;
    }
  }
  if (t) throw new j(L.INVALID_ARGUMENT, t);
  return !0;
}
const El = -62135596800, _l = 1e6;
class _e {
  /**
   * Creates a new timestamp with the current date, with millisecond precision.
   *
   * @returns a new timestamp representing the current date.
   */
  static now() {
    return _e.fromMillis(Date.now());
  }
  /**
   * Creates a new timestamp from the given date.
   *
   * @param date - The date to initialize the `Timestamp` from.
   * @returns A new `Timestamp` representing the same point in time as the given
   *     date.
   */
  static fromDate(e) {
    return _e.fromMillis(e.getTime());
  }
  /**
   * Creates a new timestamp from the given number of milliseconds.
   *
   * @param milliseconds - Number of milliseconds since Unix epoch
   *     1970-01-01T00:00:00Z.
   * @returns A new `Timestamp` representing the same point in time as the given
   *     number of milliseconds.
   */
  static fromMillis(e) {
    const t = Math.floor(e / 1e3), n = Math.floor((e - 1e3 * t) * _l);
    return new _e(t, n);
  }
  /**
   * Creates a new timestamp.
   *
   * @param seconds - The number of seconds of UTC time since Unix epoch
   *     1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to
   *     9999-12-31T23:59:59Z inclusive.
   * @param nanoseconds - The non-negative fractions of a second at nanosecond
   *     resolution. Negative second values with fractions must still have
   *     non-negative nanoseconds values that count forward in time. Must be
   *     from 0 to 999,999,999 inclusive.
   */
  constructor(e, t) {
    if (this.seconds = e, this.nanoseconds = t, t < 0) throw new j(L.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + t);
    if (t >= 1e9) throw new j(L.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + t);
    if (e < El) throw new j(L.INVALID_ARGUMENT, "Timestamp seconds out of range: " + e);
    if (e >= 253402300800) throw new j(L.INVALID_ARGUMENT, "Timestamp seconds out of range: " + e);
  }
  /**
   * Converts a `Timestamp` to a JavaScript `Date` object. This conversion
   * causes a loss of precision since `Date` objects only support millisecond
   * precision.
   *
   * @returns JavaScript `Date` object representing the same point in time as
   *     this `Timestamp`, with millisecond precision.
   */
  toDate() {
    return new Date(this.toMillis());
  }
  /**
   * Converts a `Timestamp` to a numeric timestamp (in milliseconds since
   * epoch). This operation causes a loss of precision.
   *
   * @returns The point in time corresponding to this timestamp, represented as
   *     the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
   */
  toMillis() {
    return 1e3 * this.seconds + this.nanoseconds / _l;
  }
  _compareTo(e) {
    return this.seconds === e.seconds ? oe(this.nanoseconds, e.nanoseconds) : oe(this.seconds, e.seconds);
  }
  /**
   * Returns true if this `Timestamp` is equal to the provided one.
   *
   * @param other - The `Timestamp` to compare against.
   * @returns true if this `Timestamp` is equal to the provided one.
   */
  isEqual(e) {
    return e.seconds === this.seconds && e.nanoseconds === this.nanoseconds;
  }
  /** Returns a textual representation of this `Timestamp`. */
  toString() {
    return "Timestamp(seconds=" + this.seconds + ", nanoseconds=" + this.nanoseconds + ")";
  }
  /**
   * Returns a JSON-serializable representation of this `Timestamp`.
   */
  toJSON() {
    return {
      type: _e._jsonSchemaVersion,
      seconds: this.seconds,
      nanoseconds: this.nanoseconds
    };
  }
  /**
   * Builds a `Timestamp` instance from a JSON object created by {@link Timestamp.toJSON}.
   */
  static fromJSON(e) {
    if (ei(e, _e._jsonSchema)) return new _e(e.seconds, e.nanoseconds);
  }
  /**
   * Converts this object to a primitive string, which allows `Timestamp` objects
   * to be compared using the `>`, `<=`, `>=` and `>` operators.
   */
  valueOf() {
    const e = this.seconds - El;
    return String(e).padStart(12, "0") + "." + String(this.nanoseconds).padStart(9, "0");
  }
}
_e._jsonSchemaVersion = "firestore/timestamp/1.0", _e._jsonSchema = {
  type: be("string", _e._jsonSchemaVersion),
  seconds: be("number"),
  nanoseconds: be("number")
};
class IC extends Error {
  constructor() {
    super(...arguments), this.name = "Base64DecodeError";
  }
}
class Fe {
  constructor(e) {
    this.binaryString = e;
  }
  static fromBase64String(e) {
    const t = (function(s) {
      try {
        return atob(s);
      } catch (i) {
        throw typeof DOMException < "u" && i instanceof DOMException ? new IC("Invalid base64 string: " + i) : i;
      }
    })(e);
    return new Fe(t);
  }
  static fromUint8Array(e) {
    const t = (
      /**
      * Helper function to convert an Uint8array to a binary string.
      */
      (function(s) {
        let i = "";
        for (let o = 0; o < s.length; ++o) i += String.fromCharCode(s[o]);
        return i;
      })(e)
    );
    return new Fe(t);
  }
  [Symbol.iterator]() {
    let e = 0;
    return {
      next: () => e < this.binaryString.length ? {
        value: this.binaryString.charCodeAt(e++),
        done: !1
      } : {
        value: void 0,
        done: !0
      }
    };
  }
  toBase64() {
    return (function(t) {
      return btoa(t);
    })(this.binaryString);
  }
  toUint8Array() {
    return (function(t) {
      const n = new Uint8Array(t.length);
      for (let s = 0; s < t.length; s++) n[s] = t.charCodeAt(s);
      return n;
    })(this.binaryString);
  }
  approximateByteSize() {
    return 2 * this.binaryString.length;
  }
  compareTo(e) {
    return oe(this.binaryString, e.binaryString);
  }
  isEqual(e) {
    return this.binaryString === e.binaryString;
  }
}
Fe.EMPTY_BYTE_STRING = new Fe("");
const f_ = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);
function yn(r) {
  if (Q(!!r, 39018), typeof r == "string") {
    let e = 0;
    const t = f_.exec(r);
    if (Q(!!t, 46558, {
      timestamp: r
    }), t[1]) {
      let s = t[1];
      s = (s + "000000000").substr(0, 9), e = Number(s);
    }
    const n = new Date(r);
    return {
      seconds: Math.floor(n.getTime() / 1e3),
      nanos: e
    };
  }
  return {
    seconds: ye(r.seconds),
    nanos: ye(r.nanos)
  };
}
function ye(r) {
  return typeof r == "number" ? r : typeof r == "string" ? Number(r) : 0;
}
function Tn(r) {
  return typeof r == "string" ? Fe.fromBase64String(r) : Fe.fromUint8Array(r);
}
const wC = "server_timestamp", yC = "__type__", TC = "__previous_value__", AC = "__local_write_time__";
function To(r) {
  return (r?.mapValue?.fields || {})[yC]?.stringValue === wC;
}
function ti(r) {
  const e = r.mapValue.fields[TC];
  return To(e) ? ti(e) : e;
}
function Pr(r) {
  const e = yn(r.mapValue.fields[AC].timestampValue);
  return new _e(e.seconds, e.nanos);
}
class d_ {
  /**
   * Constructs a DatabaseInfo using the provided host, databaseId and
   * persistenceKey.
   *
   * @param databaseId - The database to use.
   * @param appId - The Firebase App Id.
   * @param persistenceKey - A unique identifier for this Firestore's local
   * storage (used in conjunction with the databaseId).
   * @param host - The Firestore backend host to connect to.
   * @param ssl - Whether to use SSL when connecting.
   * @param forceLongPolling - Whether to use the forceLongPolling option
   * when using WebChannel as the network transport.
   * @param autoDetectLongPolling - Whether to use the detectBufferingProxy
   * option when using WebChannel as the network transport.
   * @param longPollingOptions - Options that configure long-polling.
   * @param useFetchStreams - Whether to use the Fetch API instead of
   * XMLHTTPRequest
   */
  constructor(e, t, n, s, i, o, B, u, c, C, f, m, R) {
    this.databaseId = e, this.appId = t, this.persistenceKey = n, this.host = s, this.ssl = i, this.forceLongPolling = o, this.autoDetectLongPolling = B, this.longPollingOptions = u, this.useFetchStreams = c, this.isUsingEmulator = C, this.apiKey = f, this._customHeaders = m, this.grpcFlowControlWindow = R;
  }
}
const ro = "(default)";
class Ss {
  constructor(e, t) {
    this.projectId = e, this.database = t || ro;
  }
  static empty() {
    return new Ss("", "");
  }
  get isDefaultDatabase() {
    return this.database === ro;
  }
  isEqual(e) {
    return e instanceof Ss && e.projectId === this.projectId && e.database === this.database;
  }
}
function p_(r, e) {
  if (!Object.prototype.hasOwnProperty.apply(r.options, ["projectId"])) throw new j(L.INVALID_ARGUMENT, '"projectId" not provided in firebase.initializeApp.');
  return new Ss(r.options.projectId, e);
}
const _B = -1;
function ni(r) {
  return r == null;
}
function Os(r) {
  return r === 0 && 1 / r == -1 / 0;
}
function g_(r) {
  return typeof r == "number" && Number.isInteger(r) && !Os(r) && r <= Number.MAX_SAFE_INTEGER && r >= Number.MIN_SAFE_INTEGER;
}
function m_(r) {
  return typeof r == "string";
}
const RC = "__type__", E_ = "__max__", Li = {
  mapValue: {}
}, vC = "__vector__", bs = "value", Sr = {
  nullValue: "NULL_VALUE"
}, at = {
  booleanValue: !0
}, He = {
  booleanValue: !1
};
function Le(r) {
  return "nullValue" in r ? 0 : "booleanValue" in r ? 1 : "integerValue" in r || "doubleValue" in r ? 2 : "timestampValue" in r ? 3 : "stringValue" in r ? 5 : "bytesValue" in r ? 6 : "referenceValue" in r ? 7 : "geoPointValue" in r ? 8 : "arrayValue" in r ? 9 : "mapValue" in r ? To(r) ? 4 : __(r) ? 9007199254740991 : so(r) ? 10 : 11 : $(28295, {
    value: r
  });
}
function Dt(r, e, t) {
  if (r === e) return !0;
  const n = Le(r);
  if (n !== Le(e)) return !1;
  switch (n) {
    case 0:
    case 9007199254740991:
      return !0;
    case 1:
      return r.booleanValue === e.booleanValue;
    case 4:
      return Pr(r).isEqual(Pr(e));
    case 3:
      return (function(i, o) {
        if (typeof i.timestampValue == "string" && typeof o.timestampValue == "string" && i.timestampValue.length === o.timestampValue.length)
          return i.timestampValue === o.timestampValue;
        const B = yn(i.timestampValue), u = yn(o.timestampValue);
        return B.seconds === u.seconds && B.nanos === u.nanos;
      })(r, e);
    case 5:
      return r.stringValue === e.stringValue;
    case 6:
      return (function(i, o) {
        return Tn(i.bytesValue).isEqual(Tn(o.bytesValue));
      })(r, e);
    case 7:
      return r.referenceValue === e.referenceValue;
    case 8:
      return (function(i, o) {
        return ye(i.geoPointValue.latitude) === ye(o.geoPointValue.latitude) && ye(i.geoPointValue.longitude) === ye(o.geoPointValue.longitude);
      })(r, e);
    case 2:
      return (function(i, o, B) {
        if ("integerValue" in i && "integerValue" in o) return ye(i.integerValue) === ye(o.integerValue);
        let u, c;
        if ("doubleValue" in i && "doubleValue" in o) u = ye(i.doubleValue), c = ye(o.doubleValue);
        else {
          if (!B?.t) return !1;
          u = ye(i.integerValue ?? i.doubleValue), c = ye(o.integerValue ?? o.doubleValue);
        }
        return u === c ? !!B?.i || Os(u) === Os(c) : !!(B === void 0 || B.o) && isNaN(u) && isNaN(c);
      })(r, e, t);
    case 9:
      return Rr(r.arrayValue.values || [], e.arrayValue.values || [], ((s, i) => Dt(s, i, t)));
    case 10:
    case 11:
      return (function(i, o, B) {
        const u = i.mapValue.fields || {}, c = o.mapValue.fields || {};
        if (no(u) !== no(c)) return !1;
        for (const C in u) if (u.hasOwnProperty(C) && (c[C] === void 0 || !Dt(u[C], c[C], B))) return !1;
        return !0;
      })(r, e, t);
    default:
      return $(52216, {
        left: r
      });
  }
}
function Ns(r, e) {
  return (r.values || []).find(((t) => Dt(t, e))) !== void 0;
}
function Bt(r, e) {
  if (r === e) return 0;
  const t = Le(r), n = Le(e);
  if (t !== n) return oe(t, n);
  switch (t) {
    case 0:
    case 9007199254740991:
      return 0;
    case 1:
      return oe(r.booleanValue, e.booleanValue);
    case 2:
      return (function(i, o) {
        const B = ye(i.integerValue || i.doubleValue), u = ye(o.integerValue || o.doubleValue);
        return B < u ? -1 : B > u ? 1 : B === u ? 0 : (
          // one or both are NaN.
          isNaN(B) ? isNaN(u) ? 0 : -1 : 1
        );
      })(r, e);
    case 3:
      return Dl(r.timestampValue, e.timestampValue);
    case 4:
      return Dl(Pr(r), Pr(e));
    case 5:
      return Ua(r.stringValue, e.stringValue);
    case 6:
      return (function(i, o) {
        const B = Tn(i), u = Tn(o);
        return B.compareTo(u);
      })(r.bytesValue, e.bytesValue);
    case 7:
      return (function(i, o) {
        const B = i.split("/"), u = o.split("/");
        for (let c = 0; c < B.length && c < u.length; c++) {
          const C = oe(B[c], u[c]);
          if (C !== 0) return C;
        }
        return oe(B.length, u.length);
      })(r.referenceValue, e.referenceValue);
    case 8:
      return (function(i, o) {
        const B = oe(ye(i.latitude), ye(o.latitude));
        return B !== 0 ? B : oe(ye(i.longitude), ye(o.longitude));
      })(r.geoPointValue, e.geoPointValue);
    case 9:
      return Il(r.arrayValue, e.arrayValue);
    case 10:
      return (function(i, o) {
        const B = i.fields || {}, u = o.fields || {}, c = B[bs]?.arrayValue, C = u[bs]?.arrayValue, f = oe(c?.values?.length || 0, C?.values?.length || 0);
        return f !== 0 ? f : Il(c, C);
      })(r.mapValue, e.mapValue);
    case 11:
      return (function(i, o) {
        if (i === Li.mapValue && o === Li.mapValue) return 0;
        if (i === Li.mapValue) return 1;
        if (o === Li.mapValue) return -1;
        const B = i.fields || {}, u = Object.keys(B), c = o.fields || {}, C = Object.keys(c);
        u.sort(), C.sort();
        for (let f = 0; f < u.length && f < C.length; ++f) {
          const m = Ua(u[f], C[f]);
          if (m !== 0) return m;
          const R = Bt(B[u[f]], c[C[f]]);
          if (R !== 0) return R;
        }
        return oe(u.length, C.length);
      })(r.mapValue, e.mapValue);
    default:
      throw $(23264, {
        u: t
      });
  }
}
function Dl(r, e) {
  if (typeof r == "string" && typeof e == "string" && r.length === e.length) return oe(r, e);
  const t = yn(r), n = yn(e), s = oe(t.seconds, n.seconds);
  return s !== 0 ? s : oe(t.nanos, n.nanos);
}
function Il(r, e) {
  const t = r.values || [], n = e.values || [];
  for (let s = 0; s < t.length && s < n.length; ++s) {
    const i = Bt(t[s], n[s]);
    if (i !== void 0 && i !== 0) return i;
  }
  return oe(t.length, n.length);
}
function Or(r) {
  return Ja(r);
}
function Ja(r) {
  return "nullValue" in r ? "null" : "booleanValue" in r ? "" + r.booleanValue : "integerValue" in r ? "" + r.integerValue : "doubleValue" in r ? "" + r.doubleValue : "timestampValue" in r ? (function(t) {
    const n = yn(t);
    return `time(${n.seconds},${n.nanos})`;
  })(r.timestampValue) : "stringValue" in r ? r.stringValue : "bytesValue" in r ? (function(t) {
    return Tn(t).toBase64();
  })(r.bytesValue) : "referenceValue" in r ? (function(t) {
    return Y.fromName(t).toString();
  })(r.referenceValue) : "geoPointValue" in r ? (function(t) {
    return `geo(${t.latitude},${t.longitude})`;
  })(r.geoPointValue) : "arrayValue" in r ? (function(t) {
    let n = "[", s = !0;
    for (const i of t.values || []) s ? s = !1 : n += ",", n += Ja(i);
    return n + "]";
  })(r.arrayValue) : "mapValue" in r ? (function(t) {
    const n = Object.keys(t.fields || {}).sort();
    let s = "{", i = !0;
    for (const o of n) i ? i = !1 : s += ",", s += `${o}:${Ja(t.fields[o])}`;
    return s + "}";
  })(r.mapValue) : $(61005, {
    value: r
  });
}
function ji(r) {
  switch (Le(r)) {
    case 0:
    case 1:
      return 4;
    case 2:
      return 8;
    case 3:
    case 8:
      return 16;
    case 4:
      const e = ti(r);
      return e ? 16 + ji(e) : 16;
    case 5:
      return 2 * r.stringValue.length;
    case 6:
      return Tn(r.bytesValue).approximateByteSize();
    case 7:
      return r.referenceValue.length;
    case 9:
      return (function(n) {
        return (n.values || []).reduce(((s, i) => s + ji(i)), 0);
      })(r.arrayValue);
    case 10:
    case 11:
      return (function(n) {
        let s = 0;
        return Ln(n.fields, ((i, o) => {
          s += i.length + ji(o);
        })), s;
      })(r.mapValue);
    default:
      throw $(13486, {
        value: r
      });
  }
}
function wl(r, e) {
  return {
    referenceValue: `projects/${r.projectId}/databases/${r.database}/documents/${e.path.canonicalString()}`
  };
}
function St(r) {
  return !!r && "integerValue" in r;
}
function zn(r) {
  return !!r && "doubleValue" in r;
}
function An(r) {
  return St(r) || zn(r);
}
function br(r) {
  return !!r && "arrayValue" in r;
}
function pt(r) {
  return !!r && "nullValue" in r;
}
function ut(r) {
  return !!r && "doubleValue" in r && isNaN(Number(r.doubleValue));
}
function Wn(r) {
  return !!r && "mapValue" in r;
}
function so(r) {
  return (r?.mapValue?.fields || {})[RC]?.stringValue === vC;
}
function ja(r) {
  return (r?.mapValue?.fields || {})[bs]?.arrayValue;
}
function ms(r) {
  if (r.geoPointValue) return {
    geoPointValue: {
      ...r.geoPointValue
    }
  };
  if (r.timestampValue && typeof r.timestampValue == "object") return {
    timestampValue: {
      ...r.timestampValue
    }
  };
  if (r.mapValue) {
    const e = {
      mapValue: {
        fields: {}
      }
    };
    return Ln(r.mapValue.fields, ((t, n) => e.mapValue.fields[t] = ms(n))), e;
  }
  if (r.arrayValue) {
    const e = {
      arrayValue: {
        values: []
      }
    };
    for (let t = 0; t < (r.arrayValue.values || []).length; ++t) e.arrayValue.values[t] = ms(r.arrayValue.values[t]);
    return e;
  }
  return {
    ...r
  };
}
function __(r) {
  return (((r.mapValue || {}).fields || {}).__type__ || {}).stringValue === E_;
}
class ze {
  constructor(e) {
    this.value = e;
  }
  static empty() {
    return new ze({
      mapValue: {}
    });
  }
  /**
   * Returns the value at the given path or null.
   *
   * @param path - the path to search
   * @returns The value at the path or null if the path is not set.
   */
  field(e) {
    if (e.isEmpty()) return this.value;
    {
      let t = this.value;
      for (let n = 0; n < e.length - 1; ++n) if (t = (t.mapValue.fields || {})[e.get(n)], !Wn(t)) return null;
      return t = (t.mapValue.fields || {})[e.lastSegment()], t || null;
    }
  }
  /**
   * Sets the field to the provided value.
   *
   * @param path - The field path to set.
   * @param value - The value to set.
   */
  set(e, t) {
    this.getFieldsMap(e.popLast())[e.lastSegment()] = ms(t);
  }
  /**
   * Sets the provided fields to the provided values.
   *
   * @param data - A map of fields to values (or null for deletes).
   */
  setAll(e) {
    let t = gt.emptyPath(), n = {}, s = [];
    e.forEach(((o, B) => {
      if (!t.isImmediateParentOf(B)) {
        const u = this.getFieldsMap(t);
        this.applyChanges(u, n, s), n = {}, s = [], t = B.popLast();
      }
      o ? n[B.lastSegment()] = ms(o) : s.push(B.lastSegment());
    }));
    const i = this.getFieldsMap(t);
    this.applyChanges(i, n, s);
  }
  /**
   * Removes the field at the specified path. If there is no field at the
   * specified path, nothing is changed.
   *
   * @param path - The field path to remove.
   */
  delete(e) {
    const t = this.field(e.popLast());
    Wn(t) && t.mapValue.fields && delete t.mapValue.fields[e.lastSegment()];
  }
  isEqual(e) {
    return Dt(this.value, e.value);
  }
  /**
   * Returns the map that contains the leaf element of `path`. If the parent
   * entry does not yet exist, or if it is not a map, a new map will be created.
   */
  getFieldsMap(e) {
    let t = this.value;
    t.mapValue.fields || (t.mapValue = {
      fields: {}
    });
    for (let n = 0; n < e.length; ++n) {
      let s = t.mapValue.fields[e.get(n)];
      Wn(s) && s.mapValue.fields || (s = {
        mapValue: {
          fields: {}
        }
      }, t.mapValue.fields[e.get(n)] = s), t = s;
    }
    return t.mapValue.fields;
  }
  /**
   * Modifies `fieldsMap` by adding, replacing or deleting the specified
   * entries.
   */
  applyChanges(e, t, n) {
    Ln(t, ((s, i) => e[s] = i));
    for (const s of n) delete e[s];
  }
  clone() {
    return new ze(ms(this.value));
  }
}
function PC(r) {
  const e = [];
  return Ln(r.fields, ((t, n) => {
    const s = new gt([t]);
    if (Wn(n)) {
      const i = PC(n.mapValue).fields;
      if (i.length === 0)
        e.push(s);
      else
        for (const o of i) e.push(s.child(o));
    } else
      e.push(s);
  })), new dt(e);
}
function Ao(r, e) {
  if (r.useProto3Json) {
    if (isNaN(e)) return {
      doubleValue: "NaN"
    };
    if (e === 1 / 0) return {
      doubleValue: "Infinity"
    };
    if (e === -1 / 0) return {
      doubleValue: "-Infinity"
    };
  }
  return {
    doubleValue: Os(e) ? "-0" : e
  };
}
function DB(r) {
  return {
    integerValue: "" + r
  };
}
function IB(r, e, t) {
  return g_(e) ? DB(e) : Ao(r, e);
}
class Ro {
  constructor() {
    this._ = void 0;
  }
}
function D_(r, e, t) {
  return r instanceof io ? (function(s, i) {
    const o = {
      fields: {
        [yC]: {
          stringValue: wC
        },
        [AC]: {
          timestampValue: {
            seconds: s.seconds,
            nanos: s.nanoseconds
          }
        }
      }
    };
    return i && To(i) && (i = ti(i)), i && (o.fields[TC] = i), {
      mapValue: o
    };
  })(t, e) : r instanceof Fs ? OC(r, e) : r instanceof Ls ? bC(r, e) : r instanceof ks ? (function(s, i) {
    const o = SC(s, i), B = Bo(o) + Bo(s.l);
    return St(o) && St(s.l) ? DB(B) : Ao(s.serializer, B);
  })(r, e) : r instanceof oo ? (function(s, i) {
    return yl(s, i, Math.min);
  })(r, e) : r instanceof ao ? (function(s, i) {
    return yl(s, i, Math.max);
  })(r, e) : void 0;
}
function I_(r, e, t) {
  return r instanceof Fs ? OC(r, e) : r instanceof Ls ? bC(r, e) : t;
}
function SC(r, e) {
  return r instanceof ks ? An(e) ? e : {
    integerValue: 0
  } : null;
}
class io extends Ro {
}
class Fs extends Ro {
  constructor(e) {
    super(), this.elements = e;
  }
}
function OC(r, e) {
  const t = NC(e);
  for (const n of r.elements) t.some(((s) => Dt(s, n))) || t.push(n);
  return {
    arrayValue: {
      values: t
    }
  };
}
class Ls extends Ro {
  constructor(e) {
    super(), this.elements = e;
  }
}
function bC(r, e) {
  let t = NC(e);
  for (const n of r.elements) t = t.filter(((s) => !Dt(s, n)));
  return {
    arrayValue: {
      values: t
    }
  };
}
class wB extends Ro {
  constructor(e, t) {
    super(), this.serializer = e, this.l = t;
  }
}
class ks extends wB {
}
class oo extends wB {
}
class ao extends wB {
}
function yl(r, e, t) {
  if (!An(e)) return r.l;
  const n = t(Bo(e), Bo(r.l));
  return St(e) && St(r.l) ? DB(n) : Ao(r.serializer, n);
}
function Bo(r) {
  return ye(r.integerValue || r.doubleValue);
}
function NC(r) {
  return br(r) && r.arrayValue.values ? r.arrayValue.values.slice() : [];
}
function w_(r, e) {
  return r.field.isEqual(e.field) && (function(n, s) {
    return n instanceof Fs && s instanceof Fs || n instanceof Ls && s instanceof Ls ? Rr(n.elements, s.elements, Dt) : n instanceof ks && s instanceof ks || n instanceof oo && s instanceof oo || n instanceof ao && s instanceof ao ? Dt(n.l, s.l) : n instanceof io && s instanceof io;
  })(r.transform, e.transform);
}
class y_ {
  constructor(e, t) {
    this.version = e, this.transformResults = t;
  }
}
class Xe {
  constructor(e, t) {
    this.updateTime = e, this.exists = t;
  }
  /** Creates a new empty Precondition. */
  static none() {
    return new Xe();
  }
  /** Creates a new Precondition with an exists flag. */
  static exists(e) {
    return new Xe(void 0, e);
  }
  /** Creates a new Precondition based on a version a document exists at. */
  static updateTime(e) {
    return new Xe(e);
  }
  /** Returns whether this Precondition is empty. */
  get isNone() {
    return this.updateTime === void 0 && this.exists === void 0;
  }
  isEqual(e) {
    return this.exists === e.exists && (this.updateTime ? !!e.updateTime && this.updateTime.isEqual(e.updateTime) : !e.updateTime);
  }
}
function qi(r, e) {
  return r.updateTime !== void 0 ? e.isFoundDocument() && e.version.isEqual(r.updateTime) : r.exists === void 0 || r.exists === e.isFoundDocument();
}
class vo {
}
function FC(r, e) {
  if (!r.hasLocalMutations || e && e.fields.length === 0) return null;
  if (e === null) return r.isNoDocument() ? new yB(r.key, Xe.none()) : new ri(r.key, r.data, Xe.none());
  {
    const t = r.data, n = ze.empty();
    let s = new Ne(gt.comparator);
    for (let i of e.fields) if (!s.has(i)) {
      let o = t.field(i);
      o === null && i.length > 1 && (i = i.popLast(), o = t.field(i)), o === null ? n.delete(i) : n.set(i, o), s = s.add(i);
    }
    return new kn(r.key, n, new dt(s.toArray()), Xe.none());
  }
}
function T_(r, e, t) {
  r instanceof ri ? (function(s, i, o) {
    const B = s.value.clone(), u = Al(s.fieldTransforms, i, o.transformResults);
    B.setAll(u), i.convertToFoundDocument(o.version, B).setHasCommittedMutations();
  })(r, e, t) : r instanceof kn ? (function(s, i, o) {
    if (!qi(s.precondition, i))
      return void i.convertToUnknownDocument(o.version);
    const B = Al(s.fieldTransforms, i, o.transformResults), u = i.data;
    u.setAll(LC(s)), u.setAll(B), i.convertToFoundDocument(o.version, u).setHasCommittedMutations();
  })(r, e, t) : (function(s, i, o) {
    i.convertToNoDocument(o.version).setHasCommittedMutations();
  })(0, e, t);
}
function Es(r, e, t, n) {
  return r instanceof ri ? (function(i, o, B, u) {
    if (!qi(i.precondition, o))
      return B;
    const c = i.value.clone(), C = Rl(i.fieldTransforms, u, o);
    return c.setAll(C), o.convertToFoundDocument(o.version, c).setHasLocalMutations(), null;
  })(r, e, t, n) : r instanceof kn ? (function(i, o, B, u) {
    if (!qi(i.precondition, o)) return B;
    const c = Rl(i.fieldTransforms, u, o), C = o.data;
    return C.setAll(LC(i)), C.setAll(c), o.convertToFoundDocument(o.version, C).setHasLocalMutations(), B === null ? null : B.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(((f) => f.field)));
  })(r, e, t, n) : (function(i, o, B) {
    return qi(i.precondition, o) ? (o.convertToNoDocument(o.version).setHasLocalMutations(), null) : B;
  })(r, e, t);
}
function A_(r, e) {
  let t = null;
  for (const n of r.fieldTransforms) {
    const s = e.data.field(n.field), i = SC(n.transform, s || null);
    i != null && (t === null && (t = ze.empty()), t.set(n.field, i));
  }
  return t || null;
}
function Tl(r, e) {
  return r.type === e.type && !!r.key.isEqual(e.key) && !!r.precondition.isEqual(e.precondition) && !!(function(n, s) {
    return n === void 0 && s === void 0 || !(!n || !s) && Rr(n, s, ((i, o) => w_(i, o)));
  })(r.fieldTransforms, e.fieldTransforms) && (r.type === 0 ? r.value.isEqual(e.value) : r.type !== 1 || r.data.isEqual(e.data) && r.fieldMask.isEqual(e.fieldMask));
}
class ri extends vo {
  constructor(e, t, n, s = []) {
    super(), this.key = e, this.value = t, this.precondition = n, this.fieldTransforms = s, this.type = 0;
  }
  getFieldMask() {
    return null;
  }
}
class kn extends vo {
  constructor(e, t, n, s, i = []) {
    super(), this.key = e, this.data = t, this.fieldMask = n, this.precondition = s, this.fieldTransforms = i, this.type = 1;
  }
  getFieldMask() {
    return this.fieldMask;
  }
}
function LC(r) {
  const e = /* @__PURE__ */ new Map();
  return r.fieldMask.fields.forEach(((t) => {
    if (!t.isEmpty()) {
      const n = r.data.field(t);
      e.set(t, n);
    }
  })), e;
}
function Al(r, e, t) {
  const n = /* @__PURE__ */ new Map();
  Q(r.length === t.length, 32656, {
    h: t.length,
    T: r.length
  });
  for (let s = 0; s < t.length; s++) {
    const i = r[s], o = i.transform, B = e.data.field(i.field);
    n.set(i.field, I_(o, B, t[s]));
  }
  return n;
}
function Rl(r, e, t) {
  const n = /* @__PURE__ */ new Map();
  for (const s of r) {
    const i = s.transform, o = t.data.field(s.field);
    n.set(s.field, D_(i, o, e));
  }
  return n;
}
class yB extends vo {
  constructor(e, t) {
    super(), this.key = e, this.precondition = t, this.type = 2, this.fieldTransforms = [];
  }
  getFieldMask() {
    return null;
  }
}
class kC extends vo {
  constructor(e, t) {
    super(), this.key = e, this.precondition = t, this.type = 3, this.fieldTransforms = [];
  }
  getFieldMask() {
    return null;
  }
}
class uo {
  constructor(e, t) {
    this.position = e, this.inclusive = t;
  }
}
function vl(r, e, t) {
  let n = 0;
  for (let s = 0; s < r.position.length; s++) {
    const i = e[s], o = r.position[s];
    if (i.field.isKeyField() ? n = Y.comparator(Y.fromName(o.referenceValue), t.key) : n = Bt(o, t.data.field(i.field)), i.dir === "desc" && (n *= -1), n !== 0) break;
  }
  return n;
}
function Pl(r, e) {
  if (r === null) return e === null;
  if (e === null || r.inclusive !== e.inclusive || r.position.length !== e.position.length) return !1;
  for (let t = 0; t < r.position.length; t++)
    if (!Dt(r.position[t], e.position[t])) return !1;
  return !0;
}
class VC {
}
class Oe extends VC {
  constructor(e, t, n) {
    super(), this.field = e, this.op = t, this.value = n;
  }
  /**
   * Creates a filter based on the provided arguments.
   */
  static create(e, t, n) {
    return e.isKeyField() ? t === "in" || t === "not-in" ? this.createKeyFieldInFilter(e, t, n) : new v_(e, t, n) : t === "array-contains" ? new O_(e, n) : t === "in" ? new b_(e, n) : t === "not-in" ? new N_(e, n) : t === "array-contains-any" ? new F_(e, n) : new Oe(e, t, n);
  }
  static createKeyFieldInFilter(e, t, n) {
    return t === "in" ? new P_(e, n) : new S_(e, n);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return this.op === "!=" ? t !== null && t.nullValue === void 0 && this.matchesComparison(Bt(t, this.value)) : t !== null && Le(this.value) === Le(t) && this.matchesComparison(Bt(t, this.value));
  }
  matchesComparison(e) {
    switch (this.op) {
      case "<":
        return e < 0;
      case "<=":
        return e <= 0;
      case "==":
        return e === 0;
      case "!=":
        return e !== 0;
      case ">":
        return e > 0;
      case ">=":
        return e >= 0;
      default:
        return $(47266, {
          operator: this.op
        });
    }
  }
  isInequality() {
    return [
      "<",
      "<=",
      ">",
      ">=",
      "!=",
      "not-in"
      /* Operator.NOT_IN */
    ].indexOf(this.op) >= 0;
  }
  getFlattenedFilters() {
    return [this];
  }
  getFilters() {
    return [this];
  }
}
class At extends VC {
  constructor(e, t) {
    super(), this.filters = e, this.op = t, this.P = null;
  }
  /**
   * Creates a filter based on the provided arguments.
   */
  static create(e, t) {
    return new At(e, t);
  }
  matches(e) {
    return xC(this) ? this.filters.find(((t) => !t.matches(e))) === void 0 : this.filters.find(((t) => t.matches(e))) !== void 0;
  }
  getFlattenedFilters() {
    return this.P !== null || (this.P = this.filters.reduce(((e, t) => e.concat(t.getFlattenedFilters())), [])), this.P;
  }
  // Returns a mutable copy of `this.filters`
  getFilters() {
    return Object.assign([], this.filters);
  }
}
function xC(r) {
  return r.op === "and";
}
function MC(r) {
  return R_(r) && xC(r);
}
function R_(r) {
  for (const e of r.filters) if (e instanceof At) return !1;
  return !0;
}
function qa(r) {
  if (r instanceof Oe)
    return r.field.canonicalString() + r.op.toString() + Or(r.value);
  if (MC(r))
    return r.filters.map(((e) => qa(e))).join(",");
  {
    const e = r.filters.map(((t) => qa(t))).join(",");
    return `${r.op}(${e})`;
  }
}
function GC(r, e) {
  return r instanceof Oe ? (function(n, s) {
    return s instanceof Oe && n.op === s.op && n.field.isEqual(s.field) && Dt(n.value, s.value);
  })(r, e) : r instanceof At ? (function(n, s) {
    return s instanceof At && n.op === s.op && n.filters.length === s.filters.length ? n.filters.reduce(((i, o, B) => i && GC(o, s.filters[B])), !0) : !1;
  })(r, e) : void $(19439);
}
function HC(r) {
  return r instanceof Oe ? (function(t) {
    return `${t.field.canonicalString()} ${t.op} ${Or(t.value)}`;
  })(r) : r instanceof At ? (function(t) {
    return t.op.toString() + " {" + t.getFilters().map(HC).join(" ,") + "}";
  })(r) : "Filter";
}
class v_ extends Oe {
  constructor(e, t, n) {
    super(e, t, n), this.key = Y.fromName(n.referenceValue);
  }
  matches(e) {
    const t = Y.comparator(e.key, this.key);
    return this.matchesComparison(t);
  }
}
class P_ extends Oe {
  constructor(e, t) {
    super(e, "in", t), this.keys = UC("in", t);
  }
  matches(e) {
    return this.keys.some(((t) => t.isEqual(e.key)));
  }
}
class S_ extends Oe {
  constructor(e, t) {
    super(e, "not-in", t), this.keys = UC("not-in", t);
  }
  matches(e) {
    return !this.keys.some(((t) => t.isEqual(e.key)));
  }
}
function UC(r, e) {
  return (e.arrayValue?.values || []).map(((t) => Y.fromName(t.referenceValue)));
}
class O_ extends Oe {
  constructor(e, t) {
    super(e, "array-contains", t);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return br(t) && Ns(t.arrayValue, this.value);
  }
}
class b_ extends Oe {
  constructor(e, t) {
    super(e, "in", t);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return t !== null && Ns(this.value.arrayValue, t);
  }
}
class N_ extends Oe {
  constructor(e, t) {
    super(e, "not-in", t);
  }
  matches(e) {
    if (Ns(this.value.arrayValue, {
      nullValue: "NULL_VALUE"
    })) return !1;
    const t = e.data.field(this.field);
    return t !== null && t.nullValue === void 0 && !Ns(this.value.arrayValue, t);
  }
}
class F_ extends Oe {
  constructor(e, t) {
    super(e, "array-contains-any", t);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return !(!br(t) || !t.arrayValue.values) && t.arrayValue.values.some(((n) => Ns(this.value.arrayValue, n)));
  }
}
class co {
  constructor(e, t = "asc") {
    this.field = e, this.dir = t;
  }
}
function L_(r, e) {
  return r.dir === e.dir && r.field.isEqual(e.field);
}
class ee {
  static fromTimestamp(e) {
    return new ee(e);
  }
  static min() {
    return new ee(new _e(0, 0));
  }
  static max() {
    return new ee(new _e(253402300799, 999999999));
  }
  constructor(e) {
    this.timestamp = e;
  }
  compareTo(e) {
    return this.timestamp._compareTo(e.timestamp);
  }
  isEqual(e) {
    return this.timestamp.isEqual(e.timestamp);
  }
  /** Returns a number representation of the version for use in spec tests. */
  toMicroseconds() {
    return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
  }
  toString() {
    return "SnapshotVersion(" + this.timestamp.toString() + ")";
  }
  toTimestamp() {
    return this.timestamp;
  }
}
class Ge {
  constructor(e, t, n, s, i, o, B) {
    this.key = e, this.documentType = t, this.version = n, this.readTime = s, this.createTime = i, this.data = o, this.documentState = B;
  }
  /**
   * Creates a document with no known version or data, but which can serve as
   * base document for mutations.
   */
  static newInvalidDocument(e) {
    return new Ge(
      e,
      0,
      /* version */
      ee.min(),
      /* readTime */
      ee.min(),
      /* createTime */
      ee.min(),
      ze.empty(),
      0
      /* DocumentState.SYNCED */
    );
  }
  /**
   * Creates a new document that is known to exist with the given data at the
   * given version.
   */
  static newFoundDocument(e, t, n, s) {
    return new Ge(
      e,
      1,
      /* version */
      t,
      /* readTime */
      ee.min(),
      /* createTime */
      n,
      s,
      0
      /* DocumentState.SYNCED */
    );
  }
  /** Creates a new document that is known to not exist at the given version. */
  static newNoDocument(e, t) {
    return new Ge(
      e,
      2,
      /* version */
      t,
      /* readTime */
      ee.min(),
      /* createTime */
      ee.min(),
      ze.empty(),
      0
      /* DocumentState.SYNCED */
    );
  }
  /**
   * Creates a new document that is known to exist at the given version but
   * whose data is not known (e.g. a document that was updated without a known
   * base document).
   */
  static newUnknownDocument(e, t) {
    return new Ge(
      e,
      3,
      /* version */
      t,
      /* readTime */
      ee.min(),
      /* createTime */
      ee.min(),
      ze.empty(),
      2
      /* DocumentState.HAS_COMMITTED_MUTATIONS */
    );
  }
  /**
   * Changes the document type to indicate that it exists and that its version
   * and data are known.
   */
  convertToFoundDocument(e, t) {
    return !this.createTime.isEqual(ee.min()) || this.documentType !== 2 && this.documentType !== 0 || (this.createTime = e), this.version = e, this.documentType = 1, this.data = t, this.documentState = 0, this;
  }
  /**
   * Changes the document type to indicate that it doesn't exist at the given
   * version.
   */
  convertToNoDocument(e) {
    return this.version = e, this.documentType = 2, this.data = ze.empty(), this.documentState = 0, this;
  }
  /**
   * Changes the document type to indicate that it exists at a given version but
   * that its data is not known (e.g. a document that was updated without a known
   * base document).
   */
  convertToUnknownDocument(e) {
    return this.version = e, this.documentType = 3, this.data = ze.empty(), this.documentState = 2, this;
  }
  setHasCommittedMutations() {
    return this.documentState = 2, this;
  }
  setHasLocalMutations() {
    return this.documentState = 1, this.version = ee.min(), this;
  }
  setReadTime(e) {
    return this.readTime = e, this;
  }
  get hasLocalMutations() {
    return this.documentState === 1;
  }
  get hasCommittedMutations() {
    return this.documentState === 2;
  }
  get hasPendingWrites() {
    return this.hasLocalMutations || this.hasCommittedMutations;
  }
  isValidDocument() {
    return this.documentType !== 0;
  }
  isFoundDocument() {
    return this.documentType === 1;
  }
  isNoDocument() {
    return this.documentType === 2;
  }
  isUnknownDocument() {
    return this.documentType === 3;
  }
  isEqual(e) {
    return e instanceof Ge && this.key.isEqual(e.key) && this.version.isEqual(e.version) && this.documentType === e.documentType && this.documentState === e.documentState && this.data.isEqual(e.data);
  }
  mutableCopy() {
    return new Ge(this.key, this.documentType, this.version, this.readTime, this.createTime, this.data.clone(), this.documentState);
  }
  toString() {
    return `Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`;
  }
}
const Vs = -1;
function k_(r, e) {
  const t = r.toTimestamp().seconds, n = r.toTimestamp().nanoseconds + 1, s = ee.fromTimestamp(n === 1e9 ? new _e(t + 1, 0) : new _e(t, n));
  return new Rn(s, Y.empty(), e);
}
function V_(r) {
  return new Rn(r.readTime, r.key, Vs);
}
class Rn {
  constructor(e, t, n) {
    this.readTime = e, this.documentKey = t, this.largestBatchId = n;
  }
  /** Returns an offset that sorts before all regular offsets. */
  static min() {
    return new Rn(ee.min(), Y.empty(), Vs);
  }
  /** Returns an offset that sorts after all regular offsets. */
  static max() {
    return new Rn(ee.max(), Y.empty(), Vs);
  }
}
function x_(r, e) {
  let t = r.readTime.compareTo(e.readTime);
  return t !== 0 ? t : (t = Y.comparator(r.documentKey, e.documentKey), t !== 0 ? t : oe(r.largestBatchId, e.largestBatchId));
}
class M_ {
  constructor(e, t = null, n = [], s = [], i = null, o = null, B = null) {
    this.path = e, this.collectionGroup = t, this.orderBy = n, this.filters = s, this.limit = i, this.startAt = o, this.endAt = B, this.R = null;
  }
}
function Sl(r, e = null, t = [], n = [], s = null, i = null, o = null) {
  return new M_(r, e, t, n, s, i, o);
}
function JC(r) {
  const e = ne(r);
  if (e.R === null) {
    let t = e.path.canonicalString();
    e.collectionGroup !== null && (t += "|cg:" + e.collectionGroup), t += "|f:", t += e.filters.map(((n) => qa(n))).join(","), t += "|ob:", t += e.orderBy.map(((n) => (function(i) {
      return i.field.canonicalString() + i.dir;
    })(n))).join(","), ni(e.limit) || (t += "|l:", t += e.limit), e.startAt && (t += "|lb:", t += e.startAt.inclusive ? "b:" : "a:", t += e.startAt.position.map(((n) => Or(n))).join(",")), e.endAt && (t += "|ub:", t += e.endAt.inclusive ? "a:" : "b:", t += e.endAt.position.map(((n) => Or(n))).join(",")), e.R = t;
  }
  return e.R;
}
function jC(r, e) {
  if (r.limit !== e.limit || r.orderBy.length !== e.orderBy.length) return !1;
  for (let t = 0; t < r.orderBy.length; t++) if (!L_(r.orderBy[t], e.orderBy[t])) return !1;
  if (r.filters.length !== e.filters.length) return !1;
  for (let t = 0; t < r.filters.length; t++) if (!GC(r.filters[t], e.filters[t])) return !1;
  return r.collectionGroup === e.collectionGroup && !!r.path.isEqual(e.path) && !!Pl(r.startAt, e.startAt) && Pl(r.endAt, e.endAt);
}
function qn(r) {
  return !!r.isCorePipeline;
}
function qC(r) {
  return !!r.path && Y.isDocumentKey(r.path) && r.collectionGroup === null && r.filters.length === 0;
}
class si {
  /**
   * Initializes a Query with a path and optional additional query constraints.
   * Path must currently be empty if this is a collection group query.
   */
  constructor(e, t = null, n = [], s = [], i = null, o = "F", B = null, u = null) {
    this.path = e, this.collectionGroup = t, this.explicitOrderBy = n, this.filters = s, this.limit = i, this.limitType = o, this.startAt = B, this.endAt = u, this.I = null, // The corresponding `Target` of this `Query` instance, for use with
    // non-aggregate queries.
    this.A = null, // The corresponding `Target` of this `Query` instance, for use with
    // aggregate queries. Unlike targets for non-aggregate queries,
    // aggregate query targets do not contain normalized order-bys, they only
    // contain explicit order-bys.
    this.V = null, this.startAt, this.endAt;
  }
}
function G_(r, e, t, n, s, i, o, B) {
  return new si(r, e, t, n, s, i, o, B);
}
function TB(r) {
  return new si(r);
}
function Ol(r) {
  return r.filters.length === 0 && r.limit === null && r.startAt == null && r.endAt == null && (r.explicitOrderBy.length === 0 || r.explicitOrderBy.length === 1 && r.explicitOrderBy[0].field.isKeyField());
}
function H_(r) {
  return Y.isDocumentKey(r.path) && r.collectionGroup === null && r.filters.length === 0;
}
function KC(r) {
  return r.collectionGroup !== null;
}
function _s(r) {
  const e = ne(r);
  if (e.I === null) {
    e.I = [];
    const t = /* @__PURE__ */ new Set();
    for (const i of e.explicitOrderBy) e.I.push(i), t.add(i.field.canonicalString());
    const n = e.explicitOrderBy.length > 0 ? e.explicitOrderBy[e.explicitOrderBy.length - 1].dir : "asc";
    (function(o) {
      let B = new Ne(gt.comparator);
      return o.filters.forEach(((u) => {
        u.getFlattenedFilters().forEach(((c) => {
          c.isInequality() && (B = B.add(c.field));
        }));
      })), B;
    })(e).forEach(((i) => {
      t.has(i.canonicalString()) || i.isKeyField() || e.I.push(new co(i, n));
    })), // Add the document key field to the last if it is not explicitly ordered.
    t.has(gt.keyField().canonicalString()) || e.I.push(new co(gt.keyField(), n));
  }
  return e.I;
}
function Ft(r) {
  const e = ne(r);
  return e.A || (e.A = U_(e, _s(r))), e.A;
}
function U_(r, e) {
  if (r.limitType === "F") return Sl(r.path, r.collectionGroup, e, r.filters, r.limit, r.startAt, r.endAt);
  {
    e = e.map(((s) => {
      const i = s.dir === "desc" ? "asc" : "desc";
      return new co(s.field, i);
    }));
    const t = r.endAt ? new uo(r.endAt.position, r.endAt.inclusive) : null, n = r.startAt ? new uo(r.startAt.position, r.startAt.inclusive) : null;
    return Sl(r.path, r.collectionGroup, e, r.filters, r.limit, t, n);
  }
}
function Ka(r, e) {
  const t = r.filters.concat([e]);
  return new si(r.path, r.collectionGroup, r.explicitOrderBy.slice(), t, r.limit, r.limitType, r.startAt, r.endAt);
}
function za(r, e, t) {
  return new si(r.path, r.collectionGroup, r.explicitOrderBy.slice(), r.filters.slice(), e, t, r.startAt, r.endAt);
}
function J_(r, e) {
  return jC(Ft(r), Ft(e)) && r.limitType === e.limitType;
}
function Ds(r) {
  return `Query(target=${(function(t) {
    let n = t.path.canonicalString();
    return t.collectionGroup !== null && (n += " collectionGroup=" + t.collectionGroup), t.filters.length > 0 && (n += `, filters: [${t.filters.map(((s) => HC(s))).join(", ")}]`), ni(t.limit) || (n += ", limit: " + t.limit), t.orderBy.length > 0 && (n += `, orderBy: [${t.orderBy.map(((s) => (function(o) {
      return `${o.field.canonicalString()} (${o.dir})`;
    })(s))).join(", ")}]`), t.startAt && (n += ", startAt: ", n += t.startAt.inclusive ? "b:" : "a:", n += t.startAt.position.map(((s) => Or(s))).join(",")), t.endAt && (n += ", endAt: ", n += t.endAt.inclusive ? "a:" : "b:", n += t.endAt.position.map(((s) => Or(s))).join(",")), `Target(${n})`;
  })(Ft(r))}; limitType=${r.limitType})`;
}
function Po(r, e) {
  return e.isFoundDocument() && (function(n, s) {
    const i = s.key.path;
    return n.collectionGroup !== null ? s.key.hasCollectionId(n.collectionGroup) && n.path.isPrefixOf(i) : Y.isDocumentKey(n.path) ? n.path.isEqual(i) : n.path.isImmediateParentOf(i);
  })(r, e) && (function(n, s) {
    for (const i of _s(n))
      if (!i.field.isKeyField() && s.data.field(i.field) === null) return !1;
    return !0;
  })(r, e) && (function(n, s) {
    for (const i of n.filters) if (!i.matches(s)) return !1;
    return !0;
  })(r, e) && (function(n, s) {
    return !(n.startAt && !/**
    * Returns true if a document sorts before a bound using the provided sort
    * order.
    */
    (function(o, B, u) {
      const c = vl(o, B, u);
      return o.inclusive ? c <= 0 : c < 0;
    })(n.startAt, _s(n), s) || n.endAt && !(function(o, B, u) {
      const c = vl(o, B, u);
      return o.inclusive ? c >= 0 : c > 0;
    })(n.endAt, _s(n), s));
  })(r, e);
}
function AB(r) {
  return (e, t) => {
    let n = !1;
    for (const s of _s(r)) {
      const i = j_(s, e, t);
      if (i !== 0) return i;
      n = n || s.field.isKeyField();
    }
    return 0;
  };
}
function j_(r, e, t) {
  const n = r.field.isKeyField() ? Y.comparator(e.key, t.key) : (function(i, o, B) {
    const u = o.data.field(i), c = B.data.field(i);
    return u !== null && c !== null ? Bt(u, c) : $(42886);
  })(r.field, e, t);
  switch (r.dir) {
    case "asc":
      return n;
    case "desc":
      return -1 * n;
    default:
      return $(19790, {
        direction: r.dir
      });
  }
}
class q_ {
  constructor(e, t) {
    this.count = e, this.unchangedNames = t;
  }
}
var Pe, ue;
function zC(r) {
  switch (r) {
    case L.OK:
      return $(64938);
    case L.CANCELLED:
    case L.UNKNOWN:
    case L.DEADLINE_EXCEEDED:
    case L.RESOURCE_EXHAUSTED:
    case L.INTERNAL:
    case L.UNAVAILABLE:
    // Unauthenticated means something went wrong with our token and we need
    // to retry with new credentials which will happen automatically.
    case L.UNAUTHENTICATED:
      return !1;
    case L.INVALID_ARGUMENT:
    case L.NOT_FOUND:
    case L.ALREADY_EXISTS:
    case L.PERMISSION_DENIED:
    case L.FAILED_PRECONDITION:
    // Aborted might be retried in some scenarios, but that is dependent on
    // the context and should handled individually by the calling code.
    // See https://cloud.google.com/apis/design/errors.
    case L.ABORTED:
    case L.OUT_OF_RANGE:
    case L.UNIMPLEMENTED:
    case L.DATA_LOSS:
      return !0;
    default:
      return $(15467, {
        code: r
      });
  }
}
function QC(r) {
  if (r === void 0)
    return Qt("GRPC error has no .code"), L.UNKNOWN;
  switch (r) {
    case Pe.OK:
      return L.OK;
    case Pe.CANCELLED:
      return L.CANCELLED;
    case Pe.UNKNOWN:
      return L.UNKNOWN;
    case Pe.DEADLINE_EXCEEDED:
      return L.DEADLINE_EXCEEDED;
    case Pe.RESOURCE_EXHAUSTED:
      return L.RESOURCE_EXHAUSTED;
    case Pe.INTERNAL:
      return L.INTERNAL;
    case Pe.UNAVAILABLE:
      return L.UNAVAILABLE;
    case Pe.UNAUTHENTICATED:
      return L.UNAUTHENTICATED;
    case Pe.INVALID_ARGUMENT:
      return L.INVALID_ARGUMENT;
    case Pe.NOT_FOUND:
      return L.NOT_FOUND;
    case Pe.ALREADY_EXISTS:
      return L.ALREADY_EXISTS;
    case Pe.PERMISSION_DENIED:
      return L.PERMISSION_DENIED;
    case Pe.FAILED_PRECONDITION:
      return L.FAILED_PRECONDITION;
    case Pe.ABORTED:
      return L.ABORTED;
    case Pe.OUT_OF_RANGE:
      return L.OUT_OF_RANGE;
    case Pe.UNIMPLEMENTED:
      return L.UNIMPLEMENTED;
    case Pe.DATA_LOSS:
      return L.DATA_LOSS;
    default:
      return $(39323, {
        code: r
      });
  }
}
(ue = Pe || (Pe = {}))[ue.OK = 0] = "OK", ue[ue.CANCELLED = 1] = "CANCELLED", ue[ue.UNKNOWN = 2] = "UNKNOWN", ue[ue.INVALID_ARGUMENT = 3] = "INVALID_ARGUMENT", ue[ue.DEADLINE_EXCEEDED = 4] = "DEADLINE_EXCEEDED", ue[ue.NOT_FOUND = 5] = "NOT_FOUND", ue[ue.ALREADY_EXISTS = 6] = "ALREADY_EXISTS", ue[ue.PERMISSION_DENIED = 7] = "PERMISSION_DENIED", ue[ue.UNAUTHENTICATED = 16] = "UNAUTHENTICATED", ue[ue.RESOURCE_EXHAUSTED = 8] = "RESOURCE_EXHAUSTED", ue[ue.FAILED_PRECONDITION = 9] = "FAILED_PRECONDITION", ue[ue.ABORTED = 10] = "ABORTED", ue[ue.OUT_OF_RANGE = 11] = "OUT_OF_RANGE", ue[ue.UNIMPLEMENTED = 12] = "UNIMPLEMENTED", ue[ue.INTERNAL = 13] = "INTERNAL", ue[ue.UNAVAILABLE = 14] = "UNAVAILABLE", ue[ue.DATA_LOSS = 15] = "DATA_LOSS";
class sr {
  constructor(e, t) {
    this.mapKeyFn = e, this.equalsFn = t, /**
     * The inner map for a key/value pair. Due to the possibility of collisions we
     * keep a list of entries that we do a linear search through to find an actual
     * match. Note that collisions should be rare, so we still expect near
     * constant time lookups in practice.
     */
    this.inner = {}, /** The number of entries stored in the map */
    this.innerSize = 0;
  }
  /** Get a value for this key, or undefined if it does not exist. */
  get(e) {
    const t = this.mapKeyFn(e), n = this.inner[t];
    if (n !== void 0) {
      for (const [s, i] of n) if (this.equalsFn(s, e)) return i;
    }
  }
  has(e) {
    return this.get(e) !== void 0;
  }
  /** Put this key and value in the map. */
  set(e, t) {
    const n = this.mapKeyFn(e), s = this.inner[n];
    if (s === void 0) return this.inner[n] = [[e, t]], void this.innerSize++;
    for (let i = 0; i < s.length; i++) if (this.equalsFn(s[i][0], e))
      return void (s[i] = [e, t]);
    s.push([e, t]), this.innerSize++;
  }
  /**
   * Remove this key from the map. Returns a boolean if anything was deleted.
   */
  delete(e) {
    const t = this.mapKeyFn(e), n = this.inner[t];
    if (n === void 0) return !1;
    for (let s = 0; s < n.length; s++) if (this.equalsFn(n[s][0], e)) return n.length === 1 ? delete this.inner[t] : n.splice(s, 1), this.innerSize--, !0;
    return !1;
  }
  forEach(e) {
    Ln(this.inner, ((t, n) => {
      for (const [s, i] of n) e(s, i);
    }));
  }
  isEmpty() {
    return _C(this.inner);
  }
  size() {
    return this.innerSize;
  }
}
const K_ = new Ie(Y.comparator);
function it() {
  return K_;
}
const WC = new Ie(Y.comparator);
function dr(...r) {
  let e = WC;
  for (const t of r) e = e.insert(t.key, t);
  return e;
}
function $C(r) {
  let e = WC;
  return r.forEach(((t, n) => e = e.insert(t, n.overlayedDocument))), e;
}
function Cn() {
  return Is();
}
function YC() {
  return Is();
}
function Is() {
  return new sr(((r) => r.toString()), ((r, e) => r.isEqual(e)));
}
const z_ = new Ie(Y.comparator), Q_ = new Ne(Y.comparator);
function ie(...r) {
  let e = Q_;
  for (const t of r) e = e.add(t);
  return e;
}
const W_ = new Ne(oe);
function $_() {
  return W_;
}
function Y_() {
  return new TextEncoder();
}
const X_ = new mn([4294967295, 4294967295], 0);
function bl(r) {
  const e = Y_().encode(r), t = new aC();
  return t.update(e), new Uint8Array(t.digest());
}
function Nl(r) {
  const e = new DataView(r.buffer), t = e.getUint32(
    0,
    /* littleEndian= */
    !0
  ), n = e.getUint32(
    4,
    /* littleEndian= */
    !0
  ), s = e.getUint32(
    8,
    /* littleEndian= */
    !0
  ), i = e.getUint32(
    12,
    /* littleEndian= */
    !0
  );
  return [new mn([t, n], 0), new mn([s, i], 0)];
}
class RB {
  constructor(e, t, n) {
    if (this.bitmap = e, this.padding = t, this.hashCount = n, t < 0 || t >= 8) throw new Cs(`Invalid padding: ${t}`);
    if (n < 0) throw new Cs(`Invalid hash count: ${n}`);
    if (e.length > 0 && this.hashCount === 0)
      throw new Cs(`Invalid hash count: ${n}`);
    if (e.length === 0 && t !== 0)
      throw new Cs(`Invalid padding when bitmap length is 0: ${t}`);
    this.m = 8 * e.length - t, // Set the bit count in Integer to avoid repetition in mightContain().
    this.p = mn.fromNumber(this.m);
  }
  // Calculate the ith hash value based on the hashed 64bit integers,
  // and calculate its corresponding bit index in the bitmap to be checked.
  S(e, t, n) {
    let s = e.add(t.multiply(mn.fromNumber(n)));
    return s.compare(X_) === 1 && (s = new mn([s.getBits(0), s.getBits(1)], 0)), s.modulo(this.p).toNumber();
  }
  // Return whether the bit on the given index in the bitmap is set to 1.
  v(e) {
    return !!(this.bitmap[Math.floor(e / 8)] & 1 << e % 8);
  }
  mightContain(e) {
    if (this.m === 0) return !1;
    const t = bl(e), [n, s] = Nl(t);
    for (let i = 0; i < this.hashCount; i++) {
      const o = this.S(n, s, i);
      if (!this.v(o)) return !1;
    }
    return !0;
  }
  /** Create bloom filter for testing purposes only. */
  static create(e, t, n) {
    const s = e % 8 == 0 ? 0 : 8 - e % 8, i = new Uint8Array(Math.ceil(e / 8)), o = new RB(i, s, t);
    return n.forEach(((B) => o.insert(B))), o;
  }
  insert(e) {
    if (this.m === 0) return;
    const t = bl(e), [n, s] = Nl(t);
    for (let i = 0; i < this.hashCount; i++) {
      const o = this.S(n, s, i);
      this.D(o);
    }
  }
  D(e) {
    const t = Math.floor(e / 8), n = e % 8;
    this.bitmap[t] |= 1 << n;
  }
}
class Cs extends Error {
  constructor() {
    super(...arguments), this.name = "BloomFilterError";
  }
}
class ii {
  constructor(e, t, n, s, i, o) {
    this.snapshotVersion = e, this.targetChanges = t, this.targetMismatches = n, this.documentUpdates = s, this.augmentedDocumentUpdates = i, this.resolvedLimboDocuments = o;
  }
  /**
   * HACK: Views require RemoteEvents in order to determine whether the view is
   * CURRENT, but secondary tabs don't receive remote events. So this method is
   * used to create a synthesized RemoteEvent that can be used to apply a
   * CURRENT status change to a View, for queries executed in a different tab.
   */
  // PORTING NOTE: Multi-tab only
  static createSynthesizedRemoteEventForCurrentChange(e, t, n) {
    const s = /* @__PURE__ */ new Map();
    return s.set(e, oi.createSynthesizedTargetChangeForCurrentChange(e, t, n)), new ii(ee.min(), s, new Ie(oe), it(), it(), ie());
  }
}
class oi {
  constructor(e, t, n, s, i) {
    this.resumeToken = e, this.current = t, this.addedDocuments = n, this.modifiedDocuments = s, this.removedDocuments = i;
  }
  /**
   * This method is used to create a synthesized TargetChanges that can be used to
   * apply a CURRENT status change to a View (for queries executed in a different
   * tab) or for new queries (to raise snapshots with correct CURRENT status).
   */
  static createSynthesizedTargetChangeForCurrentChange(e, t, n) {
    return new oi(n, t, ie(), ie(), ie());
  }
}
class Ki {
  constructor(e, t, n, s) {
    this.C = e, this.removedTargetIds = t, this.key = n, this.F = s;
  }
}
class XC {
  constructor(e, t) {
    this.targetId = e, this.O = t;
  }
}
class ZC {
  constructor(e, t, n = Fe.EMPTY_BYTE_STRING, s = null) {
    this.state = e, this.targetIds = t, this.resumeToken = n, this.cause = s;
  }
}
class Fl {
  /**
   * Track the targetId for logging.
   */
  constructor(e) {
    this.targetId = e, /**
     * The number of pending responses (adds or removes) that we are waiting on.
     * We only consider targets active that have no pending responses.
     */
    this.M = 0, /**
     * Keeps track of the document changes since the last raised snapshot.
     *
     * These changes are continuously updated as we receive document updates and
     * always reflect the current set of changes against the last issued snapshot.
     */
    this.N = Ll(), /** See public getters for explanations of these fields. */
    this.L = Fe.EMPTY_BYTE_STRING, this.B = !1, /**
     * Whether this target state should be included in the next snapshot. We
     * initialize to true so that newly-added targets are included in the next
     * RemoteEvent.
     */
    this.U = !0;
  }
  /**
   * Whether this target has been marked 'current'.
   *
   * 'Current' has special meaning in the RPC protocol: It implies that the
   * Watch backend has sent us all changes up to the point at which the target
   * was added and that the target is consistent with the rest of the watch
   * stream.
   */
  get current() {
    return this.B;
  }
  /** The last resume token sent to us for this target. */
  get resumeToken() {
    return this.L;
  }
  /** Whether this target has pending target adds or target removes. */
  get k() {
    return this.M !== 0;
  }
  /** Whether we have modified any state that should trigger a snapshot. */
  get q() {
    return this.U;
  }
  /**
   * Applies the resume token to the TargetChange, but only when it has a new
   * value. Empty resumeTokens are discarded.
   */
  $(e) {
    e.approximateByteSize() > 0 && (this.U = !0, this.L = e);
  }
  /**
   * Creates a target change from the current set of changes.
   *
   * To reset the document changes after raising this snapshot, call
   * `clearPendingChanges()`.
   */
  K() {
    let e = ie(), t = ie(), n = ie();
    return this.N.forEach(((s, i) => {
      switch (i) {
        case 0:
          e = e.add(s);
          break;
        case 2:
          t = t.add(s);
          break;
        case 1:
          n = n.add(s);
          break;
        default:
          $(38017, {
            changeType: i
          });
      }
    })), new oi(this.L, this.B, e, t, n);
  }
  /**
   * Resets the document changes and sets `hasPendingChanges` to false.
   */
  W() {
    this.U = !1, this.N = Ll();
  }
  G(e, t) {
    this.U = !0, this.N = this.N.insert(e, t);
  }
  j(e) {
    this.U = !0, this.N = this.N.remove(e);
  }
  H() {
    this.M += 1;
  }
  J() {
    this.M -= 1, Q(this.M >= 0, 3241, {
      M: this.M,
      targetId: this.targetId
    });
  }
  Y() {
    this.U = !0, this.B = !0;
  }
}
const Bs = "WatchChangeAggregator";
class Z_ {
  constructor(e) {
    this.Z = e, /**
     * The internal state of all tracked targets.
     *
     * Targets have the following lifecycle of [states] within the WatchChangeAggregator:
     * [unknown] -> recordPendingTargetRequest(t)
     *           -> [pending]
     *           -> handleTargetChange(t, Added)
     *           -> [added / !pending]
     *           -> recordPendingTargetRequest(t)
     *           -> [pending]
     *           -> handleTargetChange(t, Removed)
     *           -> [unknown]
     *
     * A reset on an [added] target leaves the target in an [added] state.
     * [added / !pending] -> handleTargetChange(t, Reset)
     *                    -> [added / !pending]
     *
     * [active]: is a substate of [added], where also `remoteStore.listenTargets.has(t) === true`.
     *           Generally it is expected that when a target is [active / !pending]
     *           then it is also [active], but the implementation does not guarantee
     *           this will always be true.
     *
     */
    this.X = /* @__PURE__ */ new Map(), /** Keeps track of the documents to update since the last raised snapshot. */
    this.ee = it(), this.te = ki(), /** Keeps track of the augmented documents to update since the last raised snapshot. */
    this.ne = it(), /** A mapping of document keys to their set of target IDs. */
    this.re = ki(), /**
     * A map of targets with existence filter mismatches. These targets are
     * known to be inconsistent and their listens needs to be re-established by
     * RemoteStore.
     */
    this.ie = new Ie(oe);
  }
  /**
   * Processes and adds the DocumentWatchChange to the current set of changes.
   */
  se(e) {
    for (const t of e.C) e.F && e.F.isFoundDocument() ? this._e(t, e.F) : this.oe(t, e.key, e.F);
    for (const t of e.removedTargetIds) this.oe(t, e.key, e.F);
  }
  /** Processes and adds the WatchTargetChange to the current set of changes. */
  ae(e) {
    this.forEachTarget(e, ((t) => {
      const n = this.X.get(t);
      if (n) switch (e.state) {
        case 0:
          this.ue(t) && n.$(e.resumeToken);
          break;
        case 1:
          n.J(), n.k || // We have a freshly added target, so we need to reset any state
          // that we had previously. This can happen e.g. when remove and add
          // back a target for existence filter mismatches.
          n.W(), n.$(e.resumeToken);
          break;
        case 2:
          n.J(), n.k || this.removeTarget(t);
          break;
        case 3:
          this.ue(t) && (n.Y(), n.$(e.resumeToken));
          break;
        case 4:
          this.ue(t) && // Reset the target and synthesizes removes for all existing
          // documents. The backend will re-add any documents that still
          // match the target before it sends the next global snapshot.
          (this.ce(t), n.$(e.resumeToken));
          break;
        default:
          $(56790, {
            state: e.state
          });
      }
      else q(Bs, `handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`);
    }));
  }
  /**
   * Iterates over all targetIds that the watch change applies to: either the
   * targetIds explicitly listed in the change or the targetIds of all currently
   * active targets.
   */
  forEachTarget(e, t) {
    e.targetIds.length > 0 ? e.targetIds.forEach(t) : this.X.forEach(((n, s) => {
      this.ue(s) && t(s);
    }));
  }
  le(e) {
    return qn(e) ? e.getPipelineSourceType() === "documents" && e.getPipelineDocuments()?.length === 1 : qC(e);
  }
  /**
   * Handles existence filters and synthesizes deletes for filter mismatches.
   * Targets that are invalidated by filter mismatches are added to
   * `pendingTargetResets`.
   */
  Ee(e) {
    const t = e.targetId, n = e.O.count, s = this.he(t);
    if (s) {
      const i = s.target;
      if (this.le(i)) if (n === 0) {
        const o = new Y(qn(i) ? he.fromString(i.getPipelineDocuments()[0]) : i.path);
        this.oe(t, o, Ge.newNoDocument(o, ee.min()));
      } else Q(n === 1, 20013, "Single document existence filter with count: " + n);
      else {
        const o = this.Te(t);
        if (o !== n) {
          const B = this.Pe(e), u = B ? this.Re(B, e, o) : 1;
          if (u !== 0) {
            this.ce(t);
            const c = u === 2 ? "TargetPurposeExistenceFilterMismatchBloom" : "TargetPurposeExistenceFilterMismatch";
            this.ie = this.ie.insert(t, c);
          }
        }
      }
    }
  }
  /**
   * Parse the bloom filter from the "unchanged_names" field of an existence
   * filter.
   */
  Pe(e) {
    const t = e.O.unchangedNames;
    if (!t || !t.bits) return null;
    const { bits: { bitmap: n = "", padding: s = 0 }, hashCount: i = 0 } = t;
    let o, B;
    try {
      o = Tn(n).toUint8Array();
    } catch (u) {
      if (u instanceof IC) return Tt("Decoding the base64 bloom filter in existence filter failed (" + u.message + "); ignoring the bloom filter and falling back to full re-query."), null;
      throw u;
    }
    try {
      B = new RB(o, s, i);
    } catch (u) {
      return Tt(u instanceof Cs ? "BloomFilter error: " : "Applying bloom filter failed: ", u), null;
    }
    return B.m === 0 ? null : B;
  }
  /**
   * Apply bloom filter to remove the deleted documents, and return the
   * application status.
   */
  Re(e, t, n) {
    return t.O.count === n - this.Ve(e, t.targetId) ? 0 : 2;
  }
  /**
   * Filter out removed documents based on bloom filter membership result and
   * return number of documents removed.
   */
  Ve(e, t) {
    const n = this.Z.getRemoteKeysForTarget(t);
    let s = 0;
    return n.forEach(((i) => {
      const o = this.Z.Ae(), B = `projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;
      e.mightContain(B) || (this.oe(
        t,
        i,
        /*updatedDocument=*/
        null
      ), s++);
    })), s;
  }
  /**
   * Converts the currently accumulated state into a remote event at the
   * provided snapshot version. Resets the accumulated changes before returning.
   */
  de(e) {
    const t = /* @__PURE__ */ new Map();
    this.X.forEach(((i, o) => {
      const B = this.he(o);
      if (B) {
        if (i.current && this.le(B.target)) {
          const u = qn(B.target) ? he.fromString(B.target.getPipelineDocuments()[0]) : B.target.path, c = new Y(u);
          this.fe(c).has(o) || this.me(o, c) || this.oe(o, c, Ge.newNoDocument(c, e));
        }
        i.q && (t.set(o, i.K()), i.W());
      }
    }));
    let n = ie();
    this.re.forEach(((i, o) => {
      let B = !0;
      o.forEachWhile(((u) => {
        const c = this.he(u);
        return !c || c.purpose === "TargetPurposeLimboResolution" || (B = !1, !1);
      })), B && (n = n.add(i));
    })), this.ee.forEach(((i, o) => o.setReadTime(e))), this.ne.forEach(((i, o) => o.setReadTime(e)));
    const s = new ii(e, t, this.ie, this.ee, this.ne, n);
    return this.ee = it(), this.te = ki(), this.ne = it(), this.re = ki(), this.ie = new Ie(oe), s;
  }
  /**
   * Adds the provided document to the internal list of document updates and
   * its document key to the given target's mapping.
   */
  // Visible for testing.
  _e(e, t) {
    const n = this.X.get(e);
    if (!n || !this.ue(e)) return void q(Bs, `addDocumentToTarget received document for unknown inactive target (${e})`);
    const s = this.me(e, t.key) ? 2 : 0;
    n.G(t.key, s), qn(this.he(e).target) && this.he(e).target.getPipelineFlavor() !== "exact" ? this.ne = this.ne.insert(t.key, t) : this.ee = this.ee.insert(t.key, t), this.te = this.te.insert(t.key, this.fe(t.key).add(e)), this.re = this.re.insert(t.key, this.pe(t.key).add(e));
  }
  /**
   * Removes the provided document from the target mapping. If the
   * document no longer matches the target, but the document's state is still
   * known (e.g. we know that the document was deleted or we received the change
   * that caused the filter mismatch), the new document can be provided
   * to update the remote document cache.
   */
  // Visible for testing.
  oe(e, t, n) {
    const s = this.X.get(e);
    s && this.ue(e) ? (this.me(e, t) ? s.G(
      t,
      1
      /* ChangeType.Removed */
    ) : (
      // The document may have entered and left the target before we raised a
      // snapshot, so we can just ignore the change.
      s.j(t)
    ), this.re = this.re.insert(t, this.pe(t).delete(e)), this.re = this.re.insert(t, this.pe(t).add(e)), n && (qn(this.he(e).target) && this.he(e).target.getPipelineFlavor() !== "exact" ? this.ne = this.ne.insert(t, n) : this.ee = this.ee.insert(t, n))) : q(Bs, `removeDocumentFromTarget received document for unknown or inactive target (${e})`);
  }
  removeTarget(e) {
    this.X.delete(e);
  }
  /**
   * Returns the current count of documents in the target. This includes both
   * the number of documents that the LocalStore considers to be part of the
   * target as well as any accumulated changes.
   */
  Te(e) {
    const t = this.X.get(e);
    if (!t) return 0;
    const n = t.K();
    return this.Z.getRemoteKeysForTarget(e).size + n.addedDocuments.size - n.removedDocuments.size;
  }
  /**
   * Increment the number of acks needed from watch before we can consider the
   * server to be 'in-sync' with the client's active targets.
   */
  H(e) {
    let t = this.X.get(e);
    t || (q(Bs, `recordPendingTargetRequest set up tracking for target ID ${e}`), t = new Fl(e), this.X.set(e, t)), t.H();
  }
  pe(e) {
    let t = this.re.get(e);
    return t || (t = new Ne(oe), this.re = this.re.insert(e, t)), t;
  }
  fe(e) {
    let t = this.te.get(e);
    return t || (t = new Ne(oe), this.te = this.te.insert(e, t)), t;
  }
  /**
   * Verifies that the user is still interested in this target (by calling
   * `getTargetDataForTarget()`) and that we are not waiting for pending ADDs
   * from watch.
   */
  ue(e) {
    const t = this.he(e) !== null;
    return t || q(Bs, "Detected inactive target", e), t;
  }
  /**
   * Returns the TargetData for an active target (i.e. a target that the user
   * is still interested in that has no outstanding target change requests).
   */
  he(e) {
    const t = this.X.get(e);
    return t === void 0 || t.k ? null : this.Z.ge(e);
  }
  /**
   * Resets the state of a Watch target to its initial state (e.g. sets
   * 'current' to false, clears the resume token and removes its target mapping
   * from all documents).
   */
  ce(e) {
    this.X.set(e, new Fl(e)), this.Z.getRemoteKeysForTarget(e).forEach(((t) => {
      this.oe(
        e,
        t,
        /*updatedDocument=*/
        null
      );
    }));
  }
  /**
   * Returns whether the LocalStore considers the document to be part of the
   * specified target.
   */
  me(e, t) {
    return this.Z.getRemoteKeysForTarget(e).has(t);
  }
}
function ki() {
  return new Ie(Y.comparator);
}
function Ll() {
  return new Ie(Y.comparator);
}
const eD = {
  asc: "ASCENDING",
  desc: "DESCENDING"
}, tD = {
  "<": "LESS_THAN",
  "<=": "LESS_THAN_OR_EQUAL",
  ">": "GREATER_THAN",
  ">=": "GREATER_THAN_OR_EQUAL",
  "==": "EQUAL",
  "!=": "NOT_EQUAL",
  "array-contains": "ARRAY_CONTAINS",
  in: "IN",
  "not-in": "NOT_IN",
  "array-contains-any": "ARRAY_CONTAINS_ANY"
}, nD = {
  and: "AND",
  or: "OR"
};
class rD {
  constructor(e, t) {
    this.databaseId = e, this.useProto3Json = t;
  }
}
function Qa(r, e) {
  return r.useProto3Json || ni(e) ? e : {
    value: e
  };
}
function lo(r, e) {
  return r.useProto3Json ? `${new Date(1e3 * e.seconds).toISOString().replace(/\.\d*/, "").replace("Z", "")}.${("000000000" + e.nanoseconds).slice(-9)}Z` : {
    seconds: "" + e.seconds,
    nanos: e.nanoseconds
  };
}
function vB(r) {
  const e = yn(r);
  return new _e(e.seconds, e.nanos);
}
function ef(r, e) {
  return r.useProto3Json ? e.toBase64() : e.toUint8Array();
}
function zi(r, e) {
  return lo(r, e.toTimestamp());
}
function mt(r) {
  return Q(!!r, 49232), ee.fromTimestamp(vB(r));
}
function PB(r, e) {
  return Wa(r, e).canonicalString();
}
function Wa(r, e) {
  const t = (function(s) {
    return new he(["projects", s.projectId, "databases", s.database]);
  })(r).child("documents");
  return e === void 0 ? t : t.child(e);
}
function tf(r) {
  const e = he.fromString(r);
  return Q(Bf(e), 10190, {
    key: e.toString()
  }), e;
}
function xs(r, e) {
  return PB(r.databaseId, e.path);
}
function ws(r, e) {
  const t = tf(e);
  if (t.get(1) !== r.databaseId.projectId) throw new j(L.INVALID_ARGUMENT, "Tried to deserialize key from different project: " + t.get(1) + " vs " + r.databaseId.projectId);
  if (t.get(3) !== r.databaseId.database) throw new j(L.INVALID_ARGUMENT, "Tried to deserialize key from different database: " + t.get(3) + " vs " + r.databaseId.database);
  return new Y(rf(t));
}
function nf(r, e) {
  return PB(r.databaseId, e);
}
function sD(r) {
  const e = tf(r);
  return e.length === 4 ? he.emptyPath() : rf(e);
}
function $a(r) {
  return new he(["projects", r.databaseId.projectId, "databases", r.databaseId.database]).canonicalString();
}
function rf(r) {
  return Q(r.length > 4 && r.get(4) === "documents", 29091, {
    key: r.toString()
  }), r.popFirst(5);
}
function kl(r, e, t) {
  return {
    name: xs(r, e),
    fields: t.value.mapValue.fields
  };
}
function iD(r, e) {
  return "found" in e ? (function(n, s) {
    Q(!!s.found, 43571), s.found.name, s.found.updateTime;
    const i = ws(n, s.found.name), o = mt(s.found.updateTime), B = s.found.createTime ? mt(s.found.createTime) : ee.min(), u = new ze({
      mapValue: {
        fields: s.found.fields
      }
    });
    return Ge.newFoundDocument(i, o, B, u);
  })(r, e) : "missing" in e ? (function(n, s) {
    Q(!!s.missing, 3894), Q(!!s.readTime, 22933);
    const i = ws(n, s.missing), o = mt(s.readTime);
    return Ge.newNoDocument(i, o);
  })(r, e) : $(7234, {
    result: e
  });
}
function oD(r, e) {
  let t;
  if ("targetChange" in e) {
    e.targetChange;
    const n = (function(c) {
      return c === "NO_CHANGE" ? 0 : c === "ADD" ? 1 : c === "REMOVE" ? 2 : c === "CURRENT" ? 3 : c === "RESET" ? 4 : $(39313, {
        state: c
      });
    })(e.targetChange.targetChangeType || "NO_CHANGE"), s = e.targetChange.targetIds || [], i = (function(c, C) {
      return c.useProto3Json ? (Q(C === void 0 || typeof C == "string", 58123), Fe.fromBase64String(C || "")) : (Q(C === void 0 || // Check if the value is an instance of both Buffer and Uint8Array,
      // despite the fact that Buffer extends Uint8Array. In some
      // environments, such as jsdom, the prototype chain of Buffer
      // does not indicate that it extends Uint8Array.
      C instanceof Buffer || C instanceof Uint8Array, 16193), Fe.fromUint8Array(C || new Uint8Array()));
    })(r, e.targetChange.resumeToken), o = e.targetChange.cause, B = o && (function(c) {
      const C = c.code === void 0 ? L.UNKNOWN : QC(c.code);
      return new j(C, c.message || "");
    })(o);
    t = new ZC(n, s, i, B || null);
  } else if ("documentChange" in e) {
    e.documentChange;
    const n = e.documentChange;
    n.document, n.document.name, n.document.updateTime;
    const s = ws(r, n.document.name), i = mt(n.document.updateTime), o = n.document.createTime ? mt(n.document.createTime) : ee.min(), B = new ze({
      mapValue: {
        fields: n.document.fields
      }
    }), u = Ge.newFoundDocument(s, i, o, B), c = n.targetIds || [], C = n.removedTargetIds || [];
    t = new Ki(c, C, u.key, u);
  } else if ("documentDelete" in e) {
    e.documentDelete;
    const n = e.documentDelete;
    n.document;
    const s = ws(r, n.document), i = n.readTime ? mt(n.readTime) : ee.min(), o = Ge.newNoDocument(s, i), B = n.removedTargetIds || [];
    t = new Ki([], B, o.key, o);
  } else if ("documentRemove" in e) {
    e.documentRemove;
    const n = e.documentRemove;
    n.document;
    const s = ws(r, n.document), i = n.removedTargetIds || [];
    t = new Ki([], i, s, null);
  } else {
    if (!("filter" in e)) return $(11601, {
      ye: e
    });
    {
      e.filter;
      const n = e.filter;
      n.targetId;
      const { count: s = 0, unchangedNames: i } = n, o = new q_(s, i), B = n.targetId;
      t = new XC(B, o);
    }
  }
  return t;
}
function sf(r, e) {
  let t;
  if (e instanceof ri) t = {
    update: kl(r, e.key, e.value)
  };
  else if (e instanceof yB) t = {
    delete: xs(r, e.key)
  };
  else if (e instanceof kn) t = {
    update: kl(r, e.key, e.data),
    updateMask: pD(e.fieldMask)
  };
  else {
    if (!(e instanceof kC)) return $(16599, {
      we: e.type
    });
    t = {
      verify: xs(r, e.key)
    };
  }
  return e.fieldTransforms.length > 0 && (t.updateTransforms = e.fieldTransforms.map(((n) => (function(i, o) {
    const B = o.transform;
    if (B instanceof io) return {
      fieldPath: o.field.canonicalString(),
      setToServerValue: "REQUEST_TIME"
    };
    if (B instanceof Fs) return {
      fieldPath: o.field.canonicalString(),
      appendMissingElements: {
        values: B.elements
      }
    };
    if (B instanceof Ls) return {
      fieldPath: o.field.canonicalString(),
      removeAllFromArray: {
        values: B.elements
      }
    };
    if (B instanceof ks) return {
      fieldPath: o.field.canonicalString(),
      increment: B.l
    };
    if (B instanceof oo) return {
      fieldPath: o.field.canonicalString(),
      minimum: B.l
    };
    if (B instanceof ao) return {
      fieldPath: o.field.canonicalString(),
      maximum: B.l
    };
    throw $(20930, {
      transform: o.transform
    });
  })(0, n)))), e.precondition.isNone || (t.currentDocument = (function(s, i) {
    return i.updateTime !== void 0 ? {
      updateTime: zi(s, i.updateTime)
    } : i.exists !== void 0 ? {
      exists: i.exists
    } : $(27497);
  })(r, e.precondition)), t;
}
function aD(r, e) {
  return r && r.length > 0 ? (Q(e !== void 0, 14353), r.map(((t) => (function(s, i) {
    let o = s.updateTime ? mt(s.updateTime) : mt(i);
    return o.isEqual(ee.min()) && // The Firestore Emulator currently returns an update time of 0 for
    // deletes of non-existing documents (rather than null). This breaks the
    // test "get deleted doc while offline with source=cache" as NoDocuments
    // with version 0 are filtered by IndexedDb's RemoteDocumentCache.
    // TODO(#2149): Remove this when Emulator is fixed
    (o = mt(i)), new y_(o, s.transformResults || []);
  })(t, e)))) : [];
}
function BD(r, e) {
  return {
    documents: [nf(r, e.path)]
  };
}
function uD(r, e) {
  const t = {
    structuredQuery: {}
  }, n = e.path;
  let s;
  e.collectionGroup !== null ? (s = n, t.structuredQuery.from = [{
    collectionId: e.collectionGroup,
    allDescendants: !0
  }]) : (s = n.popLast(), t.structuredQuery.from = [{
    collectionId: n.lastSegment()
  }]), t.parent = nf(r, s);
  const i = (function(c) {
    if (c.length !== 0)
      return af(At.create(
        c,
        "and"
        /* CompositeOperator.AND */
      ));
  })(e.filters);
  i && (t.structuredQuery.where = i);
  const o = (function(c) {
    if (c.length !== 0)
      return c.map(((C) => (
        // visible for testing
        (function(m) {
          return {
            field: pr(m.field),
            direction: CD(m.dir)
          };
        })(C)
      )));
  })(e.orderBy);
  o && (t.structuredQuery.orderBy = o);
  const B = Qa(r, e.limit);
  return B !== null && (t.structuredQuery.limit = B), e.startAt && (t.structuredQuery.startAt = (function(c) {
    return {
      before: c.inclusive,
      values: c.position
    };
  })(e.startAt)), e.endAt && (t.structuredQuery.endAt = (function(c) {
    return {
      before: !c.inclusive,
      values: c.position
    };
  })(e.endAt)), {
    be: t,
    parent: s
  };
}
function cD(r) {
  let e = sD(r.parent);
  const t = r.structuredQuery, n = t.from ? t.from.length : 0;
  let s = null;
  if (n > 0) {
    Q(n === 1, 65062);
    const C = t.from[0];
    C.allDescendants ? s = C.collectionId : e = e.child(C.collectionId);
  }
  let i = [];
  t.where && (i = (function(f) {
    const m = of(f);
    return m instanceof At && MC(m) ? m.getFilters() : [m];
  })(t.where));
  let o = [];
  t.orderBy && (o = (function(f) {
    return f.map(((m) => (function(P) {
      return new co(
        gr(P.field),
        // visible for testing
        (function(H) {
          switch (H) {
            case "ASCENDING":
              return "asc";
            case "DESCENDING":
              return "desc";
            default:
              return;
          }
        })(P.direction)
      );
    })(m)));
  })(t.orderBy));
  let B = null;
  t.limit && (B = (function(f) {
    let m;
    return m = typeof f == "object" ? f.value : f, ni(m) ? null : m;
  })(t.limit));
  let u = null;
  t.startAt && (u = (function(f) {
    const m = !!f.before, R = f.values || [];
    return new uo(R, m);
  })(t.startAt));
  let c = null;
  return t.endAt && (c = (function(f) {
    const m = !f.before, R = f.values || [];
    return new uo(R, m);
  })(t.endAt)), G_(e, s, o, i, B, "F", u, c);
}
function lD(r, e) {
  const t = (function(s) {
    switch (s) {
      case "TargetPurposeListen":
        return null;
      case "TargetPurposeExistenceFilterMismatch":
        return "existence-filter-mismatch";
      case "TargetPurposeExistenceFilterMismatchBloom":
        return "existence-filter-mismatch-bloom";
      case "TargetPurposeLimboResolution":
        return "limbo-document";
      default:
        return $(28987, {
          purpose: s
        });
    }
  })(e.purpose);
  return t == null ? null : {
    "goog-listen-tags": t
  };
}
function hD(r, e) {
  return {
    structuredPipeline: {
      pipeline: {
        stages: e.stages.map(((t) => t._toProto(r)))
      }
    }
  };
}
function of(r) {
  return r.unaryFilter !== void 0 ? (function(t) {
    switch (t.unaryFilter.op) {
      case "IS_NAN":
        const n = gr(t.unaryFilter.field);
        return Oe.create(n, "==", {
          doubleValue: NaN
        });
      case "IS_NULL":
        const s = gr(t.unaryFilter.field);
        return Oe.create(s, "==", {
          nullValue: "NULL_VALUE"
        });
      case "IS_NOT_NAN":
        const i = gr(t.unaryFilter.field);
        return Oe.create(i, "!=", {
          doubleValue: NaN
        });
      case "IS_NOT_NULL":
        const o = gr(t.unaryFilter.field);
        return Oe.create(o, "!=", {
          nullValue: "NULL_VALUE"
        });
      case "OPERATOR_UNSPECIFIED":
        return $(61313);
      default:
        return $(60726);
    }
  })(r) : r.fieldFilter !== void 0 ? (function(t) {
    return Oe.create(gr(t.fieldFilter.field), (function(s) {
      switch (s) {
        case "EQUAL":
          return "==";
        case "NOT_EQUAL":
          return "!=";
        case "GREATER_THAN":
          return ">";
        case "GREATER_THAN_OR_EQUAL":
          return ">=";
        case "LESS_THAN":
          return "<";
        case "LESS_THAN_OR_EQUAL":
          return "<=";
        case "ARRAY_CONTAINS":
          return "array-contains";
        case "IN":
          return "in";
        case "NOT_IN":
          return "not-in";
        case "ARRAY_CONTAINS_ANY":
          return "array-contains-any";
        case "OPERATOR_UNSPECIFIED":
          return $(58110);
        default:
          return $(50506);
      }
    })(t.fieldFilter.op), t.fieldFilter.value);
  })(r) : r.compositeFilter !== void 0 ? (function(t) {
    return At.create(t.compositeFilter.filters.map(((n) => of(n))), (function(s) {
      switch (s) {
        case "AND":
          return "and";
        case "OR":
          return "or";
        default:
          return $(1026);
      }
    })(t.compositeFilter.op));
  })(r) : $(30097, {
    filter: r
  });
}
function CD(r) {
  return eD[r];
}
function fD(r) {
  return tD[r];
}
function dD(r) {
  return nD[r];
}
function pr(r) {
  return {
    fieldPath: r.canonicalString()
  };
}
function gr(r) {
  return gt.fromServerFormat(r.fieldPath);
}
function af(r) {
  return r instanceof Oe ? (function(t) {
    if (t.op === "==") {
      if (ut(t.value)) return {
        unaryFilter: {
          field: pr(t.field),
          op: "IS_NAN"
        }
      };
      if (pt(t.value)) return {
        unaryFilter: {
          field: pr(t.field),
          op: "IS_NULL"
        }
      };
    } else if (t.op === "!=") {
      if (ut(t.value)) return {
        unaryFilter: {
          field: pr(t.field),
          op: "IS_NOT_NAN"
        }
      };
      if (pt(t.value)) return {
        unaryFilter: {
          field: pr(t.field),
          op: "IS_NOT_NULL"
        }
      };
    }
    return {
      fieldFilter: {
        field: pr(t.field),
        op: fD(t.op),
        value: t.value
      }
    };
  })(r) : r instanceof At ? (function(t) {
    const n = t.getFilters().map(((s) => af(s)));
    return n.length === 1 ? n[0] : {
      compositeFilter: {
        op: dD(t.op),
        filters: n
      }
    };
  })(r) : $(54877, {
    filter: r
  });
}
function pD(r) {
  const e = [];
  return r.fields.forEach(((t) => e.push(t.canonicalString()))), {
    fieldPaths: e
  };
}
function Bf(r) {
  return r.length >= 4 && r.get(0) === "projects" && r.get(2) === "databases";
}
function uf(r) {
  return !!r && typeof r._toProto == "function" && r._protoValueType === "ProtoValue";
}
function Ms(r, e) {
  const t = {
    fields: {}
  };
  return e.forEach(((n, s) => {
    if (typeof s != "string") throw new Error(`Cannot encode map with non-string key: ${s}`);
    t.fields[s] = n._toProto(r);
  })), {
    mapValue: t
  };
}
function cf(r) {
  return {
    stringValue: r
  };
}
function So(r) {
  return new rD(
    r,
    /* useProto3Json= */
    !0
  );
}
class ft {
  /** @hideconstructor */
  constructor(e) {
    this._byteString = e;
  }
  /**
   * Creates a new `Bytes` object from the given Base64 string, converting it to
   * bytes.
   *
   * @param base64 - The Base64 string used to create the `Bytes` object.
   */
  static fromBase64String(e) {
    try {
      return new ft(Fe.fromBase64String(e));
    } catch (t) {
      throw new j(L.INVALID_ARGUMENT, "Failed to construct data from Base64 string: " + t);
    }
  }
  /**
   * Creates a new `Bytes` object from the given Uint8Array.
   *
   * @param array - The Uint8Array used to create the `Bytes` object.
   */
  static fromUint8Array(e) {
    return new ft(Fe.fromUint8Array(e));
  }
  /**
   * Returns the underlying bytes as a Base64-encoded string.
   *
   * @returns The Base64-encoded string created from the `Bytes` object.
   */
  toBase64() {
    return this._byteString.toBase64();
  }
  /**
   * Returns the underlying bytes in a new `Uint8Array`.
   *
   * @returns The Uint8Array created from the `Bytes` object.
   */
  toUint8Array() {
    return this._byteString.toUint8Array();
  }
  /**
   * Returns a string representation of the `Bytes` object.
   *
   * @returns A string representation of the `Bytes` object.
   */
  toString() {
    return "Bytes(base64: " + this.toBase64() + ")";
  }
  /**
   * Returns true if this `Bytes` object is equal to the provided one.
   *
   * @param other - The `Bytes` object to compare against.
   * @returns true if this `Bytes` object is equal to the provided one.
   */
  isEqual(e) {
    return this._byteString.isEqual(e._byteString);
  }
  /**
   * Returns a JSON-serializable representation of this `Bytes` instance.
   *
   * @returns a JSON representation of this object.
   */
  toJSON() {
    return {
      type: ft._jsonSchemaVersion,
      bytes: this.toBase64()
    };
  }
  /**
   * Builds a `Bytes` instance from a JSON object created by {@link Bytes.toJSON}.
   *
   * @param json - a JSON object represention of a `Bytes` instance
   * @returns an instance of {@link Bytes} if the JSON object could be parsed. Throws a
   * {@link FirestoreError} if an error occurs.
   */
  static fromJSON(e) {
    if (ei(e, ft._jsonSchema)) return ft.fromBase64String(e.bytes);
  }
}
ft._jsonSchemaVersion = "firestore/bytes/1.0", ft._jsonSchema = {
  type: be("string", ft._jsonSchemaVersion),
  bytes: be("string")
};
class ai {
  /**
   * Creates a `FieldPath` from the provided field names. If more than one field
   * name is provided, the path will point to a nested field in a document.
   *
   * @param fieldNames - A list of field names.
   */
  constructor(...e) {
    for (let t = 0; t < e.length; ++t) if (e[t].length === 0) throw new j(L.INVALID_ARGUMENT, "Invalid field name at argument $(i + 1). Field names must not be empty.");
    this._internalPath = new gt(e);
  }
  /**
   * Returns true if this `FieldPath` is equal to the provided one.
   *
   * @param other - The `FieldPath` to compare against.
   * @returns true if this `FieldPath` is equal to the provided one.
   */
  isEqual(e) {
    return this._internalPath.isEqual(e._internalPath);
  }
}
function gD() {
  return new ai(vr);
}
class SB {
  /**
   * @param _methodName - The public API endpoint that returns this class.
   * @hideconstructor
   */
  constructor(e) {
    this._methodName = e;
  }
}
class Lt {
  /**
   * Creates a new immutable `GeoPoint` object with the provided latitude and
   * longitude values.
   * @param latitude - The latitude as number between -90 and 90.
   * @param longitude - The longitude as number between -180 and 180.
   */
  constructor(e, t) {
    if (!isFinite(e) || e < -90 || e > 90) throw new j(L.INVALID_ARGUMENT, "Latitude must be a number between -90 and 90, but was: " + e);
    if (!isFinite(t) || t < -180 || t > 180) throw new j(L.INVALID_ARGUMENT, "Longitude must be a number between -180 and 180, but was: " + t);
    this._lat = e, this._long = t;
  }
  /**
   * The latitude of this `GeoPoint` instance.
   */
  get latitude() {
    return this._lat;
  }
  /**
   * The longitude of this `GeoPoint` instance.
   */
  get longitude() {
    return this._long;
  }
  /**
   * Returns true if this `GeoPoint` is equal to the provided one.
   *
   * @param other - The `GeoPoint` to compare against.
   * @returns true if this `GeoPoint` is equal to the provided one.
   */
  isEqual(e) {
    return this._lat === e._lat && this._long === e._long;
  }
  /**
   * Actually private to JS consumers of our API, so this function is prefixed
   * with an underscore.
   */
  _compareTo(e) {
    return oe(this._lat, e._lat) || oe(this._long, e._long);
  }
  /**
   * Returns a JSON-serializable representation of this `GeoPoint` instance.
   *
   * @returns a JSON representation of this object.
   */
  toJSON() {
    return {
      latitude: this._lat,
      longitude: this._long,
      type: Lt._jsonSchemaVersion
    };
  }
  /**
   * Builds a `GeoPoint` instance from a JSON object created by {@link GeoPoint.toJSON}.
   *
   * @param json - a JSON object represention of a `GeoPoint` instance
   * @returns an instance of {@link GeoPoint} if the JSON object could be parsed. Throws a
   * {@link FirestoreError} if an error occurs.
   */
  static fromJSON(e) {
    if (ei(e, Lt._jsonSchema)) return new Lt(e.latitude, e.longitude);
  }
}
Lt._jsonSchemaVersion = "firestore/geoPoint/1.0", Lt._jsonSchema = {
  type: be("string", Lt._jsonSchemaVersion),
  latitude: be("number"),
  longitude: be("number")
};
class Ke {
  constructor(e) {
    this.uid = e;
  }
  isAuthenticated() {
    return this.uid != null;
  }
  /**
   * Returns a key representing this user, suitable for inclusion in a
   * dictionary.
   */
  toKey() {
    return this.isAuthenticated() ? "uid:" + this.uid : "anonymous-user";
  }
  isEqual(e) {
    return e.uid === this.uid;
  }
}
Ke.UNAUTHENTICATED = new Ke(null), // TODO(mikelehen): Look into getting a proper uid-equivalent for
// non-FirebaseAuth providers.
Ke.GOOGLE_CREDENTIALS = new Ke("google-credentials-uid"), Ke.FIRST_PARTY = new Ke("first-party-uid"), Ke.MOCK_USER = new Ke("mock-user");
class En {
  constructor() {
    this.promise = new Promise(((e, t) => {
      this.resolve = e, this.reject = t;
    }));
  }
}
class lf {
  constructor(e, t) {
    this.user = t, this.type = "OAuth", this.headers = /* @__PURE__ */ new Map(), this.headers.set("Authorization", `Bearer ${e}`);
  }
}
class mD {
  getToken() {
    return Promise.resolve(null);
  }
  invalidateToken() {
  }
  start(e, t) {
    e.enqueueRetryable((() => t(Ke.UNAUTHENTICATED)));
  }
  shutdown() {
  }
}
class ED {
  constructor(e) {
    this.token = e, /**
     * Stores the listener registered with setChangeListener()
     * This isn't actually necessary since the UID never changes, but we use this
     * to verify the listen contract is adhered to in tests.
     */
    this.changeListener = null;
  }
  getToken() {
    return Promise.resolve(this.token);
  }
  invalidateToken() {
  }
  start(e, t) {
    this.changeListener = t, // Fire with initial user.
    e.enqueueRetryable((() => t(this.token.user)));
  }
  shutdown() {
    this.changeListener = null;
  }
}
class _D {
  constructor(e) {
    this.ve = e, /** Tracks the current User. */
    this.currentUser = Ke.UNAUTHENTICATED, /**
     * Counter used to detect if the token changed while a getToken request was
     * outstanding.
     */
    this.De = 0, this.forceRefresh = !1, this.auth = null;
  }
  start(e, t) {
    Q(this.xe === void 0, 42304);
    let n = this.De;
    const s = (u) => this.De !== n ? (n = this.De, t(u)) : Promise.resolve();
    let i = new En();
    this.xe = () => {
      this.De++, this.currentUser = this.Ce(), i.resolve(), i = new En(), e.enqueueRetryable((() => s(this.currentUser)));
    };
    const o = () => {
      const u = i;
      e.enqueueRetryable((async () => {
        await u.promise, await s(this.currentUser);
      }));
    }, B = (u) => {
      q("FirebaseAuthCredentialsProvider", "Auth detected"), this.auth = u, this.xe && (this.auth.addAuthTokenListener(this.xe), o());
    };
    this.ve.onInit(((u) => B(u))), // Our users can initialize Auth right after Firestore, so we give it
    // a chance to register itself with the component framework before we
    // determine whether to start up in unauthenticated mode.
    setTimeout((() => {
      if (!this.auth) {
        const u = this.ve.getImmediate({
          optional: !0
        });
        u ? B(u) : (
          // If auth is still not available, proceed with `null` user
          (q("FirebaseAuthCredentialsProvider", "Auth not yet detected"), i.resolve(), i = new En())
        );
      }
    }), 0), o();
  }
  getToken() {
    const e = this.De, t = this.forceRefresh;
    return this.forceRefresh = !1, this.auth ? this.auth.getToken(t).then(((n) => (
      // Cancel the request since the token changed while the request was
      // outstanding so the response is potentially for a previous user (which
      // user, we can't be sure).
      this.De !== e ? (q("FirebaseAuthCredentialsProvider", "getToken aborted due to token change."), this.getToken()) : n ? (Q(typeof n.accessToken == "string", 31837, {
        Fe: n
      }), new lf(n.accessToken, this.currentUser)) : null
    ))) : Promise.resolve(null);
  }
  invalidateToken() {
    this.forceRefresh = !0;
  }
  shutdown() {
    this.auth && this.xe && this.auth.removeAuthTokenListener(this.xe), this.xe = void 0;
  }
  // Auth.getUid() can return null even with a user logged in. It is because
  // getUid() is synchronous, but the auth code populating Uid is asynchronous.
  // This method should only be called in the AuthTokenListener callback
  // to guarantee to get the actual user.
  Ce() {
    const e = this.auth && this.auth.getUid();
    return Q(e === null || typeof e == "string", 2055, {
      Oe: e
    }), new Ke(e);
  }
}
class DD {
  constructor(e, t, n) {
    this.Me = e, this.Ne = t, this.Le = n, this.type = "FirstParty", this.user = Ke.FIRST_PARTY, this.Be = /* @__PURE__ */ new Map();
  }
  /**
   * Gets an authorization token, using a provided factory function, or return
   * null.
   */
  Ue() {
    return this.Le ? this.Le() : null;
  }
  get headers() {
    this.Be.set("X-Goog-AuthUser", this.Me);
    const e = this.Ue();
    return e && this.Be.set("Authorization", e), this.Ne && this.Be.set("X-Goog-Iam-Authorization-Token", this.Ne), this.Be;
  }
}
class ID {
  constructor(e, t, n) {
    this.Me = e, this.Ne = t, this.Le = n;
  }
  getToken() {
    return Promise.resolve(new DD(this.Me, this.Ne, this.Le));
  }
  start(e, t) {
    e.enqueueRetryable((() => t(Ke.FIRST_PARTY)));
  }
  shutdown() {
  }
  invalidateToken() {
  }
}
class Vl {
  constructor(e) {
    this.value = e, this.type = "AppCheck", this.headers = /* @__PURE__ */ new Map(), e && e.length > 0 && this.headers.set("x-firebase-appcheck", this.value);
  }
}
class wD {
  constructor(e, t) {
    this.ke = t, this.forceRefresh = !1, this.appCheck = null, this.qe = null, this.$e = null, It(e) && e.settings.appCheckToken && (this.$e = e.settings.appCheckToken);
  }
  start(e, t) {
    Q(this.xe === void 0, 3512);
    const n = (i) => {
      i.error != null && q("FirebaseAppCheckTokenProvider", `Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);
      const o = i.token !== this.qe;
      return this.qe = i.token, q("FirebaseAppCheckTokenProvider", `Received ${o ? "new" : "existing"} token.`), o ? t(i.token) : Promise.resolve();
    };
    this.xe = (i) => {
      e.enqueueRetryable((() => n(i)));
    };
    const s = (i) => {
      q("FirebaseAppCheckTokenProvider", "AppCheck detected"), this.appCheck = i, this.xe && this.appCheck.addTokenListener(this.xe);
    };
    this.ke.onInit(((i) => s(i))), // Our users can initialize AppCheck after Firestore, so we give it
    // a chance to register itself with the component framework.
    setTimeout((() => {
      if (!this.appCheck) {
        const i = this.ke.getImmediate({
          optional: !0
        });
        i ? s(i) : (
          // If AppCheck is still not available, proceed without it.
          q("FirebaseAppCheckTokenProvider", "AppCheck not yet detected")
        );
      }
    }), 0);
  }
  getToken() {
    if (this.$e) return Promise.resolve(new Vl(this.$e));
    const e = this.forceRefresh;
    return this.forceRefresh = !1, this.appCheck ? this.appCheck.getToken(e).then(((t) => t ? (Q(typeof t.token == "string", 44558, {
      tokenResult: t
    }), this.qe = t.token, new Vl(t.token)) : null)) : Promise.resolve(null);
  }
  invalidateToken() {
    this.forceRefresh = !0;
  }
  shutdown() {
    this.appCheck && this.xe && this.appCheck.removeTokenListener(this.xe), this.xe = void 0;
  }
}
function hf(r) {
  const e = {};
  return r.timeoutSeconds !== void 0 && (e.timeoutSeconds = r.timeoutSeconds), e;
}
class yD {
  Ke(e) {
  }
  shutdown() {
  }
}
const xl = "ConnectivityMonitor";
class Ml {
  constructor() {
    this.Qe = () => this.We(), this.Ge = () => this.ze(), this.je = [], this.He();
  }
  Ke(e) {
    this.je.push(e);
  }
  shutdown() {
    window.removeEventListener("online", this.Qe), window.removeEventListener("offline", this.Ge);
  }
  He() {
    window.addEventListener("online", this.Qe), window.addEventListener("offline", this.Ge);
  }
  We() {
    q(xl, "Network connectivity changed: AVAILABLE");
    for (const e of this.je) e(
      0
      /* NetworkStatus.AVAILABLE */
    );
  }
  ze() {
    q(xl, "Network connectivity changed: UNAVAILABLE");
    for (const e of this.je) e(
      1
      /* NetworkStatus.UNAVAILABLE */
    );
  }
  // TODO(chenbrian): Consider passing in window either into this component or
  // here for testing via FakeWindow.
  /** Checks that all used attributes of window are available. */
  static Je() {
    return typeof window < "u" && window.addEventListener !== void 0 && window.removeEventListener !== void 0;
  }
}
let Vi = null;
function Ya() {
  return Vi === null ? Vi = (function() {
    return 268435456 + Math.round(2147483648 * Math.random());
  })() : Vi++, "0x" + Vi.toString(16);
}
const Ta = "RestConnection", TD = {
  BatchGetDocuments: "batchGet",
  Commit: "commit",
  RunQuery: "runQuery",
  RunAggregationQuery: "runAggregationQuery",
  ExecutePipeline: "executePipeline"
};
class AD {
  get Ye() {
    return !1;
  }
  constructor(e) {
    this.databaseInfo = e, this.databaseId = e.databaseId;
    const t = e.ssl ? "https" : "http", n = encodeURIComponent(this.databaseId.projectId), s = encodeURIComponent(this.databaseId.database);
    this.Ze = t + "://" + e.host, this.Xe = `projects/${n}/databases/${s}`, this.et = this.databaseId.database === ro ? `project_id=${n}` : `project_id=${n}&database_id=${s}`;
  }
  tt(e, t, n, s, i) {
    const o = Ya(), B = this.nt(e, t.toUriEncodedString());
    q(Ta, `Sending RPC '${e}' ${o}:`, B, n);
    const u = {
      "google-cloud-resource-prefix": this.Xe,
      "x-goog-request-params": this.et
    };
    this.rt(u, s, i);
    const { host: c } = new URL(B), C = Qs(c);
    return this.it(e, B, u, n, C).then(((f) => (q(Ta, `Received RPC '${e}' ${o}: `, f), f)), ((f) => {
      throw Tt(Ta, `RPC '${e}' ${o} failed with error: `, f, "url: ", B, "request:", n), f;
    }));
  }
  st(e, t, n, s, i, o) {
    return this.tt(e, t, n, s, i);
  }
  /**
   * Modifies the headers for a request, adding any authorization token if
   * present and any additional headers for the request.
   */
  rt(e, t, n) {
    if (e["X-Goog-Api-Client"] = // SDK_VERSION is updated to different value at runtime depending on the entry point,
    // so we need to get its value when we need it in a function.
    (function() {
      return "gl-js/ fire/" + xr;
    })(), // Content-Type: text/plain will avoid preflight requests which might
    // mess with CORS and redirects by proxies. If we add custom headers
    // we will need to change this code to potentially use the $httpOverwrite
    // parameter supported by ESF to avoid triggering preflight requests.
    e["Content-Type"] = "text/plain", this.databaseInfo.appId && (e["X-Firebase-GMPID"] = this.databaseInfo.appId), t && t.headers.forEach(((s, i) => e[i] = s)), n && n.headers.forEach(((s, i) => e[i] = s)), this.databaseInfo._customHeaders) for (const s of Object.keys(this.databaseInfo._customHeaders)) e[s] = this.databaseInfo._customHeaders[s];
  }
  nt(e, t) {
    const n = TD[e];
    let s = `${this.Ze}/v1/${t}:${n}`;
    return this.databaseInfo.apiKey && (s = `${s}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`), s;
  }
  /**
   * Closes and cleans up any resources associated with the connection. This
   * implementation is a no-op because there are no resources associated
   * with the RestConnection that need to be cleaned up.
   */
  terminate() {
  }
}
class RD {
  constructor(e) {
    this._t = e._t, this.ot = e.ot;
  }
  ut(e) {
    this.ct = e;
  }
  lt(e) {
    this.Et = e;
  }
  ht(e) {
    this.Tt = e;
  }
  onMessage(e) {
    this.Pt = e;
  }
  close() {
    this.ot();
  }
  send(e) {
    this._t(e);
  }
  Rt() {
    this.ct();
  }
  It() {
    this.Et();
  }
  At(e) {
    this.Tt(e);
  }
  Vt(e) {
    this.Pt(e);
  }
}
const qe = "WebChannelConnection", us = (r, e, t) => {
  r.listen(e, ((n) => {
    try {
      t(n);
    } catch (s) {
      setTimeout((() => {
        throw s;
      }), 0);
    }
  }));
};
class wr extends AD {
  constructor(e) {
    super(e), /** A collection of open WebChannel instances */
    this.dt = [], this.forceLongPolling = e.forceLongPolling, this.autoDetectLongPolling = e.autoDetectLongPolling, this.useFetchStreams = e.useFetchStreams, this.longPollingOptions = e.longPollingOptions;
  }
  /**
   * Initialize STAT_EVENT listener once. Subsequent calls are a no-op.
   * getStatEventTarget() returns the same target every time.
   */
  static ft() {
    if (!wr.gt) {
      const e = lC();
      us(e, cC.STAT_EVENT, ((t) => {
        t.stat === xa.PROXY ? q(qe, "STAT_EVENT: detected buffering proxy") : t.stat === xa.NOPROXY && q(qe, "STAT_EVENT: detected no buffering proxy");
      })), wr.gt = !0;
    }
  }
  it(e, t, n, s, i) {
    const o = Ya();
    return new Promise(((B, u) => {
      const c = new BC();
      c.setWithCredentials(!0), c.listenOnce(uC.COMPLETE, (() => {
        try {
          switch (c.getLastErrorCode()) {
            case Ji.NO_ERROR:
              const f = c.getResponseJson();
              q(qe, `XHR for RPC '${e}' ${o} received:`, JSON.stringify(f)), B(f);
              break;
            case Ji.TIMEOUT:
              q(qe, `RPC '${e}' ${o} timed out`), u(new j(L.DEADLINE_EXCEEDED, "Request time out"));
              break;
            case Ji.HTTP_ERROR:
              const m = c.getStatus();
              if (q(qe, `RPC '${e}' ${o} failed with status:`, m, "response text:", c.getResponseText()), m > 0) {
                let R = c.getResponseJson();
                Array.isArray(R) && (R = R[0]);
                const P = R?.error;
                if (P && P.status && P.message) {
                  const x = (function(z) {
                    const se = z.toLowerCase().replace(/_/g, "-");
                    return Object.values(L).indexOf(se) >= 0 ? se : L.UNKNOWN;
                  })(P.status);
                  u(new j(x, P.message));
                } else u(new j(L.UNKNOWN, "Server responded with status " + c.getStatus()));
              } else
                u(new j(L.UNAVAILABLE, "Connection failed."));
              break;
            default:
              $(9055, {
                yt: e,
                streamId: o,
                wt: c.getLastErrorCode(),
                bt: c.getLastError()
              });
          }
        } finally {
          q(qe, `RPC '${e}' ${o} completed.`);
        }
      }));
      const C = JSON.stringify(s);
      q(qe, `RPC '${e}' ${o} sending request:`, s), c.send(t, "POST", C, n, 15);
    }));
  }
  St(e, t, n) {
    const s = Ya(), i = [this.Ze, "/", "google.firestore.v1.Firestore", "/", e, "/channel"], o = this.createWebChannelTransport(), B = {
      // Required for backend stickiness, routing behavior is based on this
      // parameter.
      httpSessionIdParam: "gsessionid",
      initMessageHeaders: {},
      messageUrlParams: {
        // This param is used to improve routing and project isolation by the
        // backend and must be included in every request.
        database: `projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`
      },
      sendRawJson: !0,
      supportsCrossDomainXhr: !0,
      internalChannelParams: {
        // Override the default timeout (randomized between 10-20 seconds) since
        // a large write batch on a slow internet connection may take a long
        // time to send to the backend. Rather than have WebChannel impose a
        // tight timeout which could lead to infinite timeouts and retries, we
        // set it very large (5-10 minutes) and rely on the browser's builtin
        // timeouts to kick in if the request isn't working.
        forwardChannelRequestTimeoutMs: 6e5
      },
      forceLongPolling: this.forceLongPolling,
      detectBufferingProxy: this.autoDetectLongPolling
    }, u = this.longPollingOptions.timeoutSeconds;
    u !== void 0 && (B.longPollingTimeout = Math.round(1e3 * u)), this.useFetchStreams && (B.useFetchStreams = !0), this.rt(B.initMessageHeaders, t, n), // Sending the custom headers we just added to request.initMessageHeaders
    // (Authorization, etc.) will trigger the browser to make a CORS preflight
    // request because the XHR will no longer meet the criteria for a "simple"
    // CORS request:
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests
    // Therefore to avoid the CORS preflight request (an extra network
    // roundtrip), we use the encodeInitMessageHeaders option to specify that
    // the headers should instead be encoded in the request's POST payload,
    // which is recognized by the webchannel backend.
    B.encodeInitMessageHeaders = !0;
    const c = i.join("");
    q(qe, `Creating RPC '${e}' stream ${s}: ${c}`, B);
    const C = o.createWebChannel(c, B);
    this.vt(C);
    let f = !1, m = !1;
    const R = new RD({
      _t: (P) => {
        m ? q(qe, `Not sending because RPC '${e}' stream ${s} is closed:`, P) : (f || (q(qe, `Opening RPC '${e}' stream ${s} transport.`), C.open(), f = !0), q(qe, `RPC '${e}' stream ${s} sending:`, P), C.send(P));
      },
      ot: () => C.close()
    });
    return us(C, hs.EventType.OPEN, (() => {
      m || (q(qe, `RPC '${e}' stream ${s} transport opened.`), R.Rt());
    })), us(C, hs.EventType.CLOSE, (() => {
      m || (m = !0, q(qe, `RPC '${e}' stream ${s} transport closed`), R.At(), this.Dt(C));
    })), us(C, hs.EventType.ERROR, ((P) => {
      m || (m = !0, Tt(qe, `RPC '${e}' stream ${s} transport errored. Name:`, P.name, "Message:", P.message), R.At(new j(L.UNAVAILABLE, "The operation could not be completed")));
    })), us(C, hs.EventType.MESSAGE, ((P) => {
      if (!m) {
        const x = P.data[0];
        Q(!!x, 16349);
        const H = x, z = H?.error || H[0]?.error;
        if (z) {
          q(qe, `RPC '${e}' stream ${s} received error:`, z);
          const se = z.status;
          let De = (
            /**
            * Maps an error Code from a GRPC status identifier like 'NOT_FOUND'.
            *
            * @returns The Code equivalent to the given status string or undefined if
            *     there is no match.
            */
            (function(we) {
              const T = Pe[we];
              if (T !== void 0) return QC(T);
            })(se)
          ), ve = z.message;
          se === "NOT_FOUND" && ve.includes("database") && ve.includes("does not exist") && ve.includes(this.databaseId.database) && Tt(`Database '${this.databaseId.database}' not found. Please check your project configuration.`), De === void 0 && (De = L.INTERNAL, ve = "Unknown error status: " + se + " with message " + z.message), // Mark closed so no further events are propagated
          m = !0, R.At(new j(De, ve)), C.close();
        } else q(qe, `RPC '${e}' stream ${s} received:`, x), R.Vt(x);
      }
    })), // Ensure that event listeners are configured for STAT_EVENTs.
    wr.ft(), setTimeout((() => {
      R.It();
    }), 0), R;
  }
  /**
   * Closes and cleans up any resources associated with the connection.
   */
  terminate() {
    this.dt.forEach(((e) => e.close())), this.dt = [];
  }
  /**
   * Add a WebChannel instance to the collection of open instances.
   * @param webChannel
   */
  vt(e) {
    this.dt.push(e);
  }
  /**
   * Remove a WebChannel instance from the collection of open instances.
   * @param webChannel
   */
  Dt(e) {
    this.dt = this.dt.filter(((t) => t === e));
  }
  /**
   * Modifies the headers for a request, adding the api key if present,
   * and then calling super.modifyHeadersForRequest
   */
  rt(e, t, n) {
    super.rt(e, t, n), // For web channel streams, we want to send the api key in the headers.
    this.databaseInfo.apiKey && (e["x-goog-api-key"] = this.databaseInfo.apiKey);
  }
  /**
   * Wrapped for mocking.
   * @protected
   */
  createWebChannelTransport() {
    return hC();
  }
}
function vD(r) {
  return new wr(r);
}
wr.gt = !1;
class OB {
  constructor(e, t, n = 1e3, s = 1.5, i = 6e4) {
    this.xt = e, this.timerId = t, this.Ct = n, this.Ft = s, this.Ot = i, this.Mt = 0, this.Nt = null, /** The last backoff attempt, as epoch milliseconds. */
    this.Lt = Date.now(), this.reset();
  }
  /**
   * Resets the backoff delay.
   *
   * The very next backoffAndWait() will have no delay. If it is called again
   * (i.e. due to an error), initialDelayMs (plus jitter) will be used, and
   * subsequent ones will increase according to the backoffFactor.
   */
  reset() {
    this.Mt = 0;
  }
  /**
   * Resets the backoff delay to the maximum delay (e.g. for use after a
   * RESOURCE_EXHAUSTED error).
   */
  Bt() {
    this.Mt = this.Ot;
  }
  /**
   * Returns a promise that resolves after currentDelayMs, and increases the
   * delay for any subsequent attempts. If there was a pending backoff operation
   * already, it will be canceled.
   */
  Ut(e) {
    this.cancel();
    const t = Math.floor(this.Mt + this.kt()), n = Math.max(0, Date.now() - this.Lt), s = Math.max(0, t - n);
    s > 0 && q("ExponentialBackoff", `Backing off for ${s} ms (base delay: ${this.Mt} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`), this.Nt = this.xt.enqueueAfterDelay(this.timerId, s, (() => (this.Lt = Date.now(), e()))), // Apply backoff factor to determine next delay and ensure it is within
    // bounds.
    this.Mt *= this.Ft, this.Mt < this.Ct && (this.Mt = this.Ct), this.Mt > this.Ot && (this.Mt = this.Ot);
  }
  qt() {
    this.Nt !== null && (this.Nt.skipDelay(), this.Nt = null);
  }
  cancel() {
    this.Nt !== null && (this.Nt.cancel(), this.Nt = null);
  }
  /** Returns a random value in the range [-currentBaseMs/2, currentBaseMs/2] */
  kt() {
    return (Math.random() - 0.5) * this.Mt;
  }
}
const Gl = "PersistentStream";
class Cf {
  constructor(e, t, n, s, i, o, B, u) {
    this.xt = e, this.$t = n, this.Kt = s, this.connection = i, this.authCredentialsProvider = o, this.appCheckCredentialsProvider = B, this.listener = u, this.state = 0, /**
     * A close count that's incremented every time the stream is closed; used by
     * getCloseGuardedDispatcher() to invalidate callbacks that happen after
     * close.
     */
    this.Qt = 0, this.Wt = null, this.Gt = null, this.stream = null, /**
     * Count of response messages received.
     */
    this.zt = 0, this.jt = new OB(e, t);
  }
  /**
   * Returns true if start() has been called and no error has occurred. True
   * indicates the stream is open or in the process of opening (which
   * encompasses respecting backoff, getting auth tokens, and starting the
   * actual RPC). Use isOpen() to determine if the stream is open and ready for
   * outbound requests.
   */
  Ht() {
    return this.state === 1 || this.state === 5 || this.Jt();
  }
  /**
   * Returns true if the underlying RPC is open (the onOpen() listener has been
   * called) and the stream is ready for outbound requests.
   */
  Jt() {
    return this.state === 2 || this.state === 3;
  }
  /**
   * Starts the RPC. Only allowed if isStarted() returns false. The stream is
   * not immediately ready for use: onOpen() will be invoked when the RPC is
   * ready for outbound requests, at which point isOpen() will return true.
   *
   * When start returns, isStarted() will return true.
   */
  start() {
    this.zt = 0, this.state !== 4 ? this.auth() : this.Yt();
  }
  /**
   * Stops the RPC. This call is idempotent and allowed regardless of the
   * current isStarted() state.
   *
   * When stop returns, isStarted() and isOpen() will both return false.
   */
  async stop() {
    this.Ht() && await this.close(
      0
      /* PersistentStreamState.Initial */
    );
  }
  /**
   * After an error the stream will usually back off on the next attempt to
   * start it. If the error warrants an immediate restart of the stream, the
   * sender can use this to indicate that the receiver should not back off.
   *
   * Each error will call the onClose() listener. That function can decide to
   * inhibit backoff if required.
   */
  Zt() {
    this.state = 0, this.jt.reset();
  }
  /**
   * Marks this stream as idle. If no further actions are performed on the
   * stream for one minute, the stream will automatically close itself and
   * notify the stream's onClose() handler with Status.OK. The stream will then
   * be in a !isStarted() state, requiring the caller to start the stream again
   * before further use.
   *
   * Only streams that are in state 'Open' can be marked idle, as all other
   * states imply pending network operations.
   */
  Xt() {
    this.Jt() && this.Wt === null && (this.Wt = this.xt.enqueueAfterDelay(this.$t, 6e4, (() => this.en())));
  }
  /** Sends a message to the underlying stream. */
  tn(e) {
    this.nn(), this.stream.send(e);
  }
  /** Called by the idle timer when the stream should close due to inactivity. */
  async en() {
    if (this.Jt())
      return this.close(
        0
        /* PersistentStreamState.Initial */
      );
  }
  /** Marks the stream as active again. */
  nn() {
    this.Wt && (this.Wt.cancel(), this.Wt = null);
  }
  /** Cancels the health check delayed operation. */
  rn() {
    this.Gt && (this.Gt.cancel(), this.Gt = null);
  }
  /**
   * Closes the stream and cleans up as necessary:
   *
   * * closes the underlying GRPC stream;
   * * calls the onClose handler with the given 'error';
   * * sets internal stream state to 'finalState';
   * * adjusts the backoff timer based on the error
   *
   * A new stream can be opened by calling start().
   *
   * @param finalState - the intended state of the stream after closing.
   * @param error - the error the connection was closed with.
   */
  async close(e, t) {
    this.nn(), this.rn(), this.jt.cancel(), // Invalidates any stream-related callbacks (e.g. from auth or the
    // underlying stream), guaranteeing they won't execute.
    this.Qt++, e !== 4 ? (
      // If this is an intentional close ensure we don't delay our next connection attempt.
      this.jt.reset()
    ) : t && t.code === L.RESOURCE_EXHAUSTED ? (
      // Log the error. (Probably either 'quota exceeded' or 'max queue length reached'.)
      (Qt(t.toString()), Qt("Using maximum backoff delay to prevent overloading the backend."), this.jt.Bt())
    ) : t && t.code === L.UNAUTHENTICATED && this.state !== 3 && // "unauthenticated" error means the token was rejected. This should rarely
    // happen since both Auth and AppCheck ensure a sufficient TTL when we
    // request a token. If a user manually resets their system clock this can
    // fail, however. In this case, we should get a Code.UNAUTHENTICATED error
    // before we received the first message and we need to invalidate the token
    // to ensure that we fetch a new token.
    (this.authCredentialsProvider.invalidateToken(), this.appCheckCredentialsProvider.invalidateToken()), // Clean up the underlying stream because we are no longer interested in events.
    this.stream !== null && (this.sn(), this.stream.close(), this.stream = null), // This state must be assigned before calling onClose() to allow the callback to
    // inhibit backoff or otherwise manipulate the state in its non-started state.
    this.state = e, // Notify the listener that the stream closed.
    await this.listener.ht(t);
  }
  /**
   * Can be overridden to perform additional cleanup before the stream is closed.
   * Calling super.tearDown() is not required.
   */
  sn() {
  }
  auth() {
    this.state = 1;
    const e = this._n(this.Qt), t = this.Qt;
    Promise.all([this.authCredentialsProvider.getToken(), this.appCheckCredentialsProvider.getToken()]).then((([n, s]) => {
      this.Qt === t && // Normally we'd have to schedule the callback on the AsyncQueue.
      // However, the following calls are safe to be called outside the
      // AsyncQueue since they don't chain asynchronous calls
      this.an(n, s);
    }), ((n) => {
      e((() => {
        const s = new j(L.UNKNOWN, "Fetching auth token failed: " + n.message);
        return this.un(s);
      }));
    }));
  }
  an(e, t) {
    const n = this._n(this.Qt);
    this.stream = this.cn(e, t), this.stream.ut((() => {
      n((() => this.listener.ut()));
    })), this.stream.lt((() => {
      n((() => (this.state = 2, this.Gt = this.xt.enqueueAfterDelay(this.Kt, 1e4, (() => (this.Jt() && (this.state = 3), Promise.resolve()))), this.listener.lt())));
    })), this.stream.ht(((s) => {
      n((() => this.un(s)));
    })), this.stream.onMessage(((s) => {
      n((() => ++this.zt == 1 ? this.En(s) : this.onNext(s)));
    }));
  }
  Yt() {
    this.state = 5, this.jt.Ut((async () => {
      this.state = 0, this.start();
    }));
  }
  // Visible for tests
  un(e) {
    return q(Gl, `close with error: ${e}`), this.stream = null, this.close(4, e);
  }
  /**
   * Returns a "dispatcher" function that dispatches operations onto the
   * AsyncQueue but only runs them if closeCount remains unchanged. This allows
   * us to turn auth / stream callbacks into no-ops if the stream is closed /
   * re-opened, etc.
   */
  _n(e) {
    return (t) => {
      this.xt.enqueueAndForget((() => this.Qt === e ? t() : (q(Gl, "stream callback skipped by getCloseGuardedDispatcher."), Promise.resolve())));
    };
  }
}
class PD extends Cf {
  constructor(e, t, n, s, i, o) {
    super(e, "listen_stream_connection_backoff", "listen_stream_idle", "health_check_timeout", t, n, s, o), this.serializer = i;
  }
  cn(e, t) {
    return this.connection.St("Listen", e, t);
  }
  En(e) {
    return this.onNext(e);
  }
  onNext(e) {
    this.jt.reset();
    const t = oD(this.serializer, e), n = (function(i) {
      if (!("targetChange" in i)) return ee.min();
      const o = i.targetChange;
      return o.targetIds && o.targetIds.length ? ee.min() : o.readTime ? mt(o.readTime) : ee.min();
    })(e);
    return this.listener.hn(t, n);
  }
  /**
   * Registers interest in the results of the given target. If the target
   * includes a resumeToken it will be included in the request. Results that
   * affect the target will be streamed back as WatchChange messages that
   * reference the targetId.
   */
  Tn(e) {
    const t = {};
    t.database = $a(this.serializer), t.addTarget = (function(i, o) {
      let B;
      const u = o.target;
      if (B = qn(u) ? {
        pipelineQuery: hD(i, u)
      } : qC(u) ? {
        documents: BD(i, u)
      } : {
        query: uD(i, u).be
      }, B.targetId = o.targetId, o.resumeToken.approximateByteSize() > 0) {
        B.resumeToken = ef(i, o.resumeToken);
        const c = Qa(i, o.expectedCount);
        c !== null && (B.expectedCount = c);
      } else if (o.snapshotVersion.compareTo(ee.min()) > 0) {
        B.readTime = lo(i, o.snapshotVersion.toTimestamp());
        const c = Qa(i, o.expectedCount);
        c !== null && (B.expectedCount = c);
      }
      return B;
    })(this.serializer, e);
    const n = lD(this.serializer, e);
    n && (t.labels = n), this.tn(t);
  }
  /**
   * Unregisters interest in the results of the target associated with the
   * given targetId.
   */
  Pn(e) {
    const t = {};
    t.database = $a(this.serializer), t.removeTarget = e, this.tn(t);
  }
}
class SD extends Cf {
  constructor(e, t, n, s, i, o) {
    super(e, "write_stream_connection_backoff", "write_stream_idle", "health_check_timeout", t, n, s, o), this.serializer = i;
  }
  /**
   * Tracks whether or not a handshake has been successfully exchanged and
   * the stream is ready to accept mutations.
   */
  get Rn() {
    return this.zt > 0;
  }
  // Override of PersistentStream.start
  start() {
    this.lastStreamToken = void 0, super.start();
  }
  sn() {
    this.Rn && this.In([]);
  }
  cn(e, t) {
    return this.connection.St("Write", e, t);
  }
  En(e) {
    return Q(!!e.streamToken, 31322), this.lastStreamToken = e.streamToken, // The first response is always the handshake response
    Q(!e.writeResults || e.writeResults.length === 0, 55816), this.listener.An();
  }
  onNext(e) {
    Q(!!e.streamToken, 12678), this.lastStreamToken = e.streamToken, // A successful first write response means the stream is healthy,
    // Note, that we could consider a successful handshake healthy, however,
    // the write itself might be causing an error we want to back off from.
    this.jt.reset();
    const t = aD(e.writeResults, e.commitTime), n = mt(e.commitTime);
    return this.listener.Vn(n, t);
  }
  /**
   * Sends an initial streamToken to the server, performing the handshake
   * required to make the StreamingWrite RPC work. Subsequent
   * calls should wait until onHandshakeComplete was called.
   */
  dn() {
    const e = {};
    e.database = $a(this.serializer), this.tn(e);
  }
  /** Sends a group of mutations to the Firestore backend to apply. */
  In(e) {
    const t = {
      streamToken: this.lastStreamToken,
      writes: e.map(((n) => sf(this.serializer, n)))
    };
    this.tn(t);
  }
}
class OD {
}
class bD extends OD {
  constructor(e, t, n, s) {
    super(), this.authCredentials = e, this.appCheckCredentials = t, this.connection = n, this.serializer = s, this.fn = !1;
  }
  mn() {
    if (this.fn) throw new j(L.FAILED_PRECONDITION, "The client has already been terminated.");
  }
  /** Invokes the provided RPC with auth and AppCheck tokens. */
  tt(e, t, n, s) {
    return this.mn(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then((([i, o]) => this.connection.tt(e, Wa(t, n), s, i, o))).catch(((i) => {
      throw i.name === "FirebaseError" ? (i.code === L.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), i) : new j(L.UNKNOWN, i.toString());
    }));
  }
  /** Invokes the provided RPC with streamed results with auth and AppCheck tokens. */
  st(e, t, n, s, i) {
    return this.mn(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then((([o, B]) => this.connection.st(e, Wa(t, n), s, o, B, i))).catch(((o) => {
      throw o.name === "FirebaseError" ? (o.code === L.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), o) : new j(L.UNKNOWN, o.toString());
    }));
  }
  terminate() {
    this.fn = !0, this.connection.terminate();
  }
}
function ND(r, e, t, n) {
  return new bD(r, e, t, n);
}
const FD = "ComponentProvider", Hl = /* @__PURE__ */ new Map();
function LD(r, e, t, n, s) {
  return new d_(r, e, t, s.host, s.ssl, s.experimentalForceLongPolling, s.experimentalAutoDetectLongPolling, hf(s.experimentalLongPollingOptions), s.useFetchStreams, s.isUsingEmulator, n, s._customHeaders, s.grpcFlowControlWindow);
}
const Ul = {
  didRun: !1,
  sequenceNumbersCollected: 0,
  targetsRemoved: 0,
  documentsRemoved: 0
}, ff = 41943040;
class rt {
  static withCacheSize(e) {
    return new rt(e, rt.DEFAULT_COLLECTION_PERCENTILE, rt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT);
  }
  constructor(e, t, n) {
    this.cacheSizeCollectionThreshold = e, this.percentileToCollect = t, this.maximumSequenceNumbersToCollect = n;
  }
}
rt.DEFAULT_COLLECTION_PERCENTILE = 10, rt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT = 1e3, rt.DEFAULT = new rt(ff, rt.DEFAULT_COLLECTION_PERCENTILE, rt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT), rt.DISABLED = new rt(-1, 0, 0);
class Oo {
  constructor(e, t) {
    this.previousValue = e, t && (t.sequenceNumberHandler = (n) => this.pn(n), this.gn = (n) => t.writeSequenceNumber(n));
  }
  pn(e) {
    return this.previousValue = Math.max(e, this.previousValue), this.previousValue;
  }
  next() {
    const e = ++this.previousValue;
    return this.gn && this.gn(e), e;
  }
}
Oo.yn = -1;
const kD = "The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";
class VD {
  constructor() {
    this.onCommittedListeners = [];
  }
  addOnCommittedListener(e) {
    this.onCommittedListeners.push(e);
  }
  raiseOnCommittedEvent() {
    this.onCommittedListeners.forEach(((e) => e()));
  }
}
async function Mr(r) {
  if (r.code !== L.FAILED_PRECONDITION || r.message !== kD) throw r;
  q("LocalStore", "Unexpectedly lost primary lease");
}
class k {
  constructor(e) {
    this.nextCallback = null, this.catchCallback = null, // When the operation resolves, we'll set result or error and mark isDone.
    this.result = void 0, this.error = void 0, this.isDone = !1, // Set to true when .then() or .catch() are called and prevents additional
    // chaining.
    this.callbackAttached = !1, e(((t) => {
      this.isDone = !0, this.result = t, this.nextCallback && // value should be defined unless T is Void, but we can't express
      // that in the type system.
      this.nextCallback(t);
    }), ((t) => {
      this.isDone = !0, this.error = t, this.catchCallback && this.catchCallback(t);
    }));
  }
  catch(e) {
    return this.next(void 0, e);
  }
  next(e, t) {
    return this.callbackAttached && $(59440), this.callbackAttached = !0, this.isDone ? this.error ? this.wrapFailure(t, this.error) : this.wrapSuccess(e, this.result) : new k(((n, s) => {
      this.nextCallback = (i) => {
        this.wrapSuccess(e, i).next(n, s);
      }, this.catchCallback = (i) => {
        this.wrapFailure(t, i).next(n, s);
      };
    }));
  }
  toPromise() {
    return new Promise(((e, t) => {
      this.next(e, t);
    }));
  }
  wrapUserFunction(e) {
    try {
      const t = e();
      return t instanceof k ? t : k.resolve(t);
    } catch (t) {
      return k.reject(t);
    }
  }
  wrapSuccess(e, t) {
    return e ? this.wrapUserFunction((() => e(t))) : k.resolve(t);
  }
  wrapFailure(e, t) {
    return e ? this.wrapUserFunction((() => e(t))) : k.reject(t);
  }
  static resolve(e) {
    return new k(((t, n) => {
      t(e);
    }));
  }
  static reject(e) {
    return new k(((t, n) => {
      n(e);
    }));
  }
  static waitFor(e) {
    return new k(((t, n) => {
      let s = 0, i = 0, o = !1;
      e.forEach(((B) => {
        ++s, B.next((() => {
          ++i, o && i === s && t();
        }), ((u) => n(u)));
      })), o = !0, i === s && t();
    }));
  }
  /**
   * Given an array of predicate functions that asynchronously evaluate to a
   * boolean, implements a short-circuiting `or` between the results. Predicates
   * will be evaluated until one of them returns `true`, then stop. The final
   * result will be whether any of them returned `true`.
   */
  static or(e) {
    let t = k.resolve(!1);
    for (const n of e) t = t.next(((s) => s ? k.resolve(s) : n()));
    return t;
  }
  static forEach(e, t) {
    const n = [];
    return e.forEach(((s, i) => {
      n.push(t.call(this, s, i));
    })), this.waitFor(n);
  }
  /**
   * Concurrently map all array elements through asynchronous function.
   */
  static mapArray(e, t) {
    return new k(((n, s) => {
      const i = e.length, o = new Array(i);
      let B = 0;
      for (let u = 0; u < i; u++) {
        const c = u;
        t(e[c]).next(((C) => {
          o[c] = C, ++B, B === i && n(o);
        }), ((C) => s(C)));
      }
    }));
  }
  /**
   * An alternative to recursive PersistencePromise calls, that avoids
   * potential memory problems from unbounded chains of promises.
   *
   * The `action` will be called repeatedly while `condition` is true.
   */
  static doWhile(e, t) {
    return new k(((n, s) => {
      const i = () => {
        e() === !0 ? t().next((() => {
          i();
        }), s) : n();
      };
      i();
    }));
  }
}
function xD(r) {
  const e = r.match(/Android ([\d.]+)/i), t = e ? e[1].split(".").slice(0, 2).join(".") : "-1";
  return Number(t);
}
function Gr(r) {
  return r.name === "IndexedDbTransactionError";
}
const Jl = "LruGarbageCollector", MD = 1048576;
function jl([r, e], [t, n]) {
  const s = oe(r, t);
  return s === 0 ? oe(e, n) : s;
}
class GD {
  constructor(e) {
    this.Jn = e, this.buffer = new Ne(jl), this.Yn = 0;
  }
  Zn() {
    return ++this.Yn;
  }
  Xn(e) {
    const t = [e, this.Zn()];
    if (this.buffer.size < this.Jn) this.buffer = this.buffer.add(t);
    else {
      const n = this.buffer.last();
      jl(t, n) < 0 && (this.buffer = this.buffer.delete(n).add(t));
    }
  }
  get maxValue() {
    return this.buffer.last()[0];
  }
}
class HD {
  constructor(e, t, n) {
    this.garbageCollector = e, this.asyncQueue = t, this.localStore = n, this.er = null;
  }
  start() {
    this.garbageCollector.params.cacheSizeCollectionThreshold !== -1 && this.tr(6e4);
  }
  stop() {
    this.er && (this.er.cancel(), this.er = null);
  }
  get started() {
    return this.er !== null;
  }
  tr(e) {
    q(Jl, `Garbage collection scheduled in ${e}ms`), this.er = this.asyncQueue.enqueueAfterDelay("lru_garbage_collection", e, (async () => {
      this.er = null;
      try {
        await this.localStore.collectGarbage(this.garbageCollector);
      } catch (t) {
        Gr(t) ? q(Jl, "Ignoring IndexedDB error during garbage collection: ", t) : await Mr(t);
      }
      await this.tr(3e5);
    }));
  }
}
class UD {
  constructor(e, t) {
    this.nr = e, this.params = t;
  }
  calculateTargetCount(e, t) {
    return this.nr.rr(e).next(((n) => Math.floor(t / 100 * n)));
  }
  nthSequenceNumber(e, t) {
    if (t === 0) return k.resolve(Oo.yn);
    const n = new GD(t);
    return this.nr.forEachTarget(e, ((s) => n.Xn(s.sequenceNumber))).next((() => this.nr.ir(e, ((s) => n.Xn(s))))).next((() => n.maxValue));
  }
  removeTargets(e, t, n) {
    return this.nr.removeTargets(e, t, n);
  }
  removeOrphanedDocuments(e, t) {
    return this.nr.removeOrphanedDocuments(e, t);
  }
  collect(e, t) {
    return this.params.cacheSizeCollectionThreshold === -1 ? (q("LruGarbageCollector", "Garbage collection skipped; disabled"), k.resolve(Ul)) : this.getCacheSize(e).next(((n) => n < this.params.cacheSizeCollectionThreshold ? (q("LruGarbageCollector", `Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`), Ul) : this.sr(e, t)));
  }
  getCacheSize(e) {
    return this.nr.getCacheSize(e);
  }
  sr(e, t) {
    let n, s, i, o, B, u, c;
    const C = Date.now();
    return this.calculateTargetCount(e, this.params.percentileToCollect).next(((f) => (
      // Cap at the configured max
      (f > this.params.maximumSequenceNumbersToCollect ? (q("LruGarbageCollector", `Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${f}`), s = this.params.maximumSequenceNumbersToCollect) : s = f, o = Date.now(), this.nthSequenceNumber(e, s))
    ))).next(((f) => (n = f, B = Date.now(), this.removeTargets(e, n, t)))).next(((f) => (i = f, u = Date.now(), this.removeOrphanedDocuments(e, n)))).next(((f) => (c = Date.now(), Cr() <= ae.DEBUG && q("LruGarbageCollector", `LRU Garbage Collection
	Counted targets in ${o - C}ms
	Determined least recently used ${s} in ` + (B - o) + `ms
	Removed ${i} targets in ` + (u - B) + `ms
	Removed ${f} documents in ` + (c - u) + `ms
Total Duration: ${c - C}ms`), k.resolve({
      didRun: !0,
      sequenceNumbersCollected: s,
      targetsRemoved: i,
      documentsRemoved: f
    }))));
  }
}
function JD(r, e) {
  return new UD(r, e);
}
const df = "firestore.googleapis.com", ql = !0;
class Kl {
  constructor(e) {
    if (e.host === void 0) {
      if (e.ssl !== void 0) throw new j(L.INVALID_ARGUMENT, "Can't provide ssl option if host option is not set");
      this.host = df, this.ssl = ql;
    } else this.host = e.host, this.ssl = e.ssl ?? ql;
    if (this.isUsingEmulator = e.emulatorOptions !== void 0, this.credentials = e.credentials, this.ignoreUndefinedProperties = !!e.ignoreUndefinedProperties, this.localCache = e.localCache, e._customHeaders && (this._customHeaders = {
      ...e._customHeaders
    }), e.cacheSizeBytes === void 0) this.cacheSizeBytes = ff;
    else {
      if (e.cacheSizeBytes !== -1 && e.cacheSizeBytes < MD) throw new j(L.INVALID_ARGUMENT, "cacheSizeBytes must be at least 1048576");
      this.cacheSizeBytes = e.cacheSizeBytes;
    }
    if (C_("experimentalForceLongPolling", e.experimentalForceLongPolling, "experimentalAutoDetectLongPolling", e.experimentalAutoDetectLongPolling), this.experimentalForceLongPolling = !!e.experimentalForceLongPolling, this.experimentalForceLongPolling ? this.experimentalAutoDetectLongPolling = !1 : e.experimentalAutoDetectLongPolling === void 0 ? this.experimentalAutoDetectLongPolling = !0 : (
      // For backwards compatibility, coerce the value to boolean even though
      // the TypeScript compiler has narrowed the type to boolean already.
      // noinspection PointlessBooleanExpressionJS
      this.experimentalAutoDetectLongPolling = !!e.experimentalAutoDetectLongPolling
    ), this.experimentalLongPollingOptions = hf(e.experimentalLongPollingOptions ?? {}), (function(n) {
      if (n.timeoutSeconds !== void 0) {
        if (isNaN(n.timeoutSeconds)) throw new j(L.INVALID_ARGUMENT, `invalid long polling timeout: ${n.timeoutSeconds} (must not be NaN)`);
        if (n.timeoutSeconds < 5) throw new j(L.INVALID_ARGUMENT, `invalid long polling timeout: ${n.timeoutSeconds} (minimum allowed value is 5)`);
        if (n.timeoutSeconds > 30) throw new j(L.INVALID_ARGUMENT, `invalid long polling timeout: ${n.timeoutSeconds} (maximum allowed value is 30)`);
      }
    })(this.experimentalLongPollingOptions), this.useFetchStreams = !!e.useFetchStreams, e.grpcFlowControlWindow !== void 0) {
      if (typeof e.grpcFlowControlWindow != "number" || e.grpcFlowControlWindow <= 0 || e.grpcFlowControlWindow > 2147483647 || !Number.isInteger(e.grpcFlowControlWindow)) throw new j(L.INVALID_ARGUMENT, "grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");
      this.grpcFlowControlWindow = e.grpcFlowControlWindow;
    }
  }
  isEqual(e) {
    return this.host === e.host && this.ssl === e.ssl && this.credentials === e.credentials && this.cacheSizeBytes === e.cacheSizeBytes && this.experimentalForceLongPolling === e.experimentalForceLongPolling && this.experimentalAutoDetectLongPolling === e.experimentalAutoDetectLongPolling && /**
    * @license
    * Copyright 2023 Google LLC
    *
    * Licensed under the Apache License, Version 2.0 (the "License");
    * you may not use this file except in compliance with the License.
    * You may obtain a copy of the License at
    *
    *   http://www.apache.org/licenses/LICENSE-2.0
    *
    * Unless required by applicable law or agreed to in writing, software
    * distributed under the License is distributed on an "AS IS" BASIS,
    * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    * See the License for the specific language governing permissions and
    * limitations under the License.
    */
    /**
    * Compares two `ExperimentalLongPollingOptions` objects for equality.
    */
    (function(n, s) {
      return n.timeoutSeconds === s.timeoutSeconds;
    })(this.experimentalLongPollingOptions, e.experimentalLongPollingOptions) && this.ignoreUndefinedProperties === e.ignoreUndefinedProperties && this.useFetchStreams === e.useFetchStreams && this.grpcFlowControlWindow === e.grpcFlowControlWindow && (function(n, s) {
      if (n === s) return !0;
      if (!n || !s) return !1;
      const i = Object.keys(n), o = Object.keys(s);
      if (i.length !== o.length) return !1;
      for (const B of i) if (n[B] !== s[B]) return !1;
      return !0;
    })(this._customHeaders, e._customHeaders);
  }
}
let bo = class {
  /** @hideconstructor */
  constructor(e, t, n, s) {
    this._authCredentials = e, this._appCheckCredentials = t, this._databaseId = n, this._app = s, /**
     * Whether it's a Firestore or Firestore Lite instance.
     */
    this.type = "firestore-lite", this._persistenceKey = "(lite)", this._settings = new Kl({}), this._settingsFrozen = !1, this._emulatorOptions = {}, // A task that is assigned when the terminate() is invoked and resolved when
    // all components have shut down. Otherwise, Firestore is not terminated,
    // which can mean either the FirestoreClient is in the process of starting,
    // or restarting.
    this._terminateTask = "notTerminated";
  }
  /**
   * The {@link @firebase/app#FirebaseApp} associated with this `Firestore` service
   * instance.
   */
  get app() {
    if (!this._app) throw new j(L.FAILED_PRECONDITION, "Firestore was not initialized using the Firebase SDK. 'app' is not available");
    return this._app;
  }
  get _initialized() {
    return this._settingsFrozen;
  }
  get _terminated() {
    return this._terminateTask !== "notTerminated";
  }
  _setSettings(e) {
    if (this._settingsFrozen) throw new j(L.FAILED_PRECONDITION, "Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");
    this._settings = new Kl(e), this._emulatorOptions = e.emulatorOptions || {}, e.credentials !== void 0 && (this._authCredentials = (function(n) {
      if (!n) return new mD();
      switch (n.type) {
        case "firstParty":
          return new ID(n.sessionIndex || "0", n.iamToken || null, n.authTokenFactory || null);
        case "provider":
          return n.client;
        default:
          throw new j(L.INVALID_ARGUMENT, "makeAuthCredentialsProvider failed due to invalid credential type");
      }
    })(e.credentials));
  }
  _getSettings() {
    return this._settings;
  }
  _getEmulatorOptions() {
    return this._emulatorOptions;
  }
  _freezeSettings() {
    return this._settingsFrozen = !0, this._settings;
  }
  _delete() {
    return this._terminateTask === "notTerminated" && (this._terminateTask = this._terminate()), this._terminateTask;
  }
  async _restart() {
    this._terminateTask === "notTerminated" ? await this._terminate() : this._terminateTask = "notTerminated";
  }
  /** Returns a JSON-serializable representation of this `Firestore` instance. */
  toJSON() {
    return {
      app: this._app,
      databaseId: this._databaseId,
      settings: this._settings
    };
  }
  /**
   * Terminates all components used by this client. Subclasses can override
   * this method to clean up their own dependencies, but must also call this
   * method.
   *
   * Only ever called once.
   */
  _terminate() {
    return (function(t) {
      const n = Hl.get(t);
      n && (q(FD, "Removing Datastore"), Hl.delete(t), n.terminate());
    })(this), Promise.resolve();
  }
};
function jD(r, e, t, n = {}) {
  r = jt(r, bo);
  const s = Qs(e), i = r._getSettings(), o = {
    ...i,
    emulatorOptions: r._getEmulatorOptions()
  }, B = `${e}:${t}`;
  s && _h(`https://${B}`), i.host !== df && i.host !== B && Tt("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");
  const u = {
    ...i,
    host: B,
    ssl: s,
    emulatorOptions: n
  };
  if (!Yn(u, o) && (r._setSettings(u), n.mockUserToken)) {
    let c, C;
    if (typeof n.mockUserToken == "string") c = n.mockUserToken, C = Ke.MOCK_USER;
    else {
      c = Zd(n.mockUserToken, r._app?.options.projectId);
      const f = n.mockUserToken.sub || n.mockUserToken.user_id;
      if (!f) throw new j(L.INVALID_ARGUMENT, "mockUserToken must contain 'sub' or 'user_id' field!");
      C = new Ke(f);
    }
    r._authCredentials = new ED(new lf(c, C));
  }
}
class Hr {
  // This is the lite version of the Query class in the main SDK.
  /** @hideconstructor protected */
  constructor(e, t, n) {
    this.converter = t, this._query = n, /** The type of this Firestore reference. */
    this.type = "query", this.firestore = e;
  }
  withConverter(e) {
    return new Hr(this.firestore, e, this._query);
  }
}
class Te {
  /** @hideconstructor */
  constructor(e, t, n) {
    this.converter = t, this._key = n, /** The type of this Firestore reference. */
    this.type = "document", this.firestore = e;
  }
  get _path() {
    return this._key.path;
  }
  /**
   * The document's identifier within its collection.
   */
  get id() {
    return this._key.path.lastSegment();
  }
  /**
   * A string representing the path of the referenced document (relative
   * to the root of the database).
   */
  get path() {
    return this._key.path.canonicalString();
  }
  /**
   * The collection this `DocumentReference` belongs to.
   */
  get parent() {
    return new _n(this.firestore, this.converter, this._key.path.popLast());
  }
  withConverter(e) {
    return new Te(this.firestore, e, this._key);
  }
  /**
   * Returns a JSON-serializable representation of this `DocumentReference` instance.
   *
   * @returns a JSON representation of this object.
   */
  toJSON() {
    return {
      type: Te._jsonSchemaVersion,
      referencePath: this._key.toString()
    };
  }
  static fromJSON(e, t, n) {
    if (ei(t, Te._jsonSchema)) return new Te(e, n || null, new Y(he.fromString(t.referencePath)));
  }
}
Te._jsonSchemaVersion = "firestore/documentReference/1.0", Te._jsonSchema = {
  type: be("string", Te._jsonSchemaVersion),
  referencePath: be("string")
};
class _n extends Hr {
  /** @hideconstructor */
  constructor(e, t, n) {
    super(e, t, TB(n)), this._path = n, /** The type of this Firestore reference. */
    this.type = "collection";
  }
  /** The collection's identifier. */
  get id() {
    return this._query.path.lastSegment();
  }
  /**
   * A string representing the path of the referenced collection (relative
   * to the root of the database).
   */
  get path() {
    return this._query.path.canonicalString();
  }
  /**
   * A reference to the containing `DocumentReference` if this is a
   * subcollection. If this isn't a subcollection, the reference is null.
   */
  get parent() {
    const e = this._path.popLast();
    return e.isEmpty() ? null : new Te(
      this.firestore,
      /* converter= */
      null,
      new Y(e)
    );
  }
  withConverter(e) {
    return new _n(this.firestore, e, this._path);
  }
}
function pT(r, e, ...t) {
  if (r = Re(r), DC("collection", "path", e), r instanceof bo) {
    const n = he.fromString(e, ...t);
    return ml(n), new _n(
      r,
      /* converter= */
      null,
      n
    );
  }
  {
    if (!(r instanceof Te || r instanceof _n)) throw new j(L.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
    const n = r._path.child(he.fromString(e, ...t));
    return ml(n), new _n(
      r.firestore,
      /* converter= */
      null,
      n
    );
  }
}
function gT(r, e, ...t) {
  if (r = Re(r), // We allow omission of 'pathString' but explicitly prohibit passing in both
  // 'undefined' and 'null'.
  arguments.length === 1 && (e = EB.newId()), DC("doc", "path", e), r instanceof bo) {
    const n = he.fromString(e, ...t);
    return gl(n), new Te(
      r,
      /* converter= */
      null,
      new Y(n)
    );
  }
  {
    if (!(r instanceof Te || r instanceof _n)) throw new j(L.INVALID_ARGUMENT, "Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
    const n = r._path.child(he.fromString(e, ...t));
    return gl(n), new Te(r.firestore, r instanceof _n ? r.converter : null, new Y(n));
  }
}
class ot {
  /**
   * @private
   * @internal
   */
  constructor(e) {
    this._values = (e || []).map(((t) => t));
  }
  /**
   * Returns a copy of the raw number array form of the vector.
   */
  toArray() {
    return this._values.map(((e) => e));
  }
  /**
   * Returns `true` if the two `VectorValue` values have the same raw number arrays, returns `false` otherwise.
   */
  isEqual(e) {
    return (function(n, s) {
      if (n.length !== s.length) return !1;
      for (let i = 0; i < n.length; ++i) if (n[i] !== s[i]) return !1;
      return !0;
    })(this._values, e._values);
  }
  /**
   * Returns a JSON-serializable representation of this `VectorValue` instance.
   *
   * @returns a JSON representation of this object.
   */
  toJSON() {
    return {
      type: ot._jsonSchemaVersion,
      vectorValues: this._values
    };
  }
  /**
   * Builds a `VectorValue` instance from a JSON object created by {@link VectorValue.toJSON}.
   *
   * @param json - a JSON object represention of a `VectorValue` instance.
   * @returns an instance of {@link VectorValue} if the JSON object could be parsed. Throws a
   * {@link FirestoreError} if an error occurs.
   */
  static fromJSON(e) {
    if (ei(e, ot._jsonSchema)) {
      if (Array.isArray(e.vectorValues) && e.vectorValues.every(((t) => typeof t == "number"))) return new ot(e.vectorValues);
      throw new j(L.INVALID_ARGUMENT, "Expected 'vectorValues' field to be a number array");
    }
  }
}
ot._jsonSchemaVersion = "firestore/vectorValue/1.0", ot._jsonSchema = {
  type: be("string", ot._jsonSchemaVersion),
  vectorValues: be("object")
};
const qD = /^__.*__$/;
class KD {
  constructor(e, t, n) {
    this.data = e, this.fieldMask = t, this.fieldTransforms = n;
  }
  toMutation(e, t) {
    return this.fieldMask !== null ? new kn(e, this.data, this.fieldMask, t, this.fieldTransforms) : new ri(e, this.data, t, this.fieldTransforms);
  }
}
class pf {
  constructor(e, t, n) {
    this.data = e, this.fieldMask = t, this.fieldTransforms = n;
  }
  toMutation(e, t) {
    return new kn(e, this.data, this.fieldMask, t, this.fieldTransforms);
  }
}
function gf(r) {
  switch (r) {
    case 0:
    // fall through
    case 2:
    // fall through
    case 1:
      return !0;
    case 3:
    case 4:
      return !1;
    default:
      throw $(40011, {
        dataSource: r
      });
  }
}
class bB {
  /**
   * Initializes a ParseContext with the given source and path.
   *
   * @param settings - The settings for the parser.
   * @param databaseId - The database ID of the Firestore instance.
   * @param serializer - The serializer to use to generate the Value proto.
   * @param ignoreUndefinedProperties - Whether to ignore undefined properties
   * rather than throw.
   * @param fieldTransforms - A mutable list of field transforms encountered
   * while parsing the data.
   * @param fieldMask - A mutable list of field paths encountered while parsing
   * the data.
   *
   * TODO(b/34871131): We don't support array paths right now, so path can be
   * null to indicate the context represents any location within an array (in
   * which case certain features will not work and errors will be somewhat
   * compromised).
   */
  constructor(e, t, n, s, i, o) {
    this.settings = e, this.databaseId = t, this.serializer = n, this.ignoreUndefinedProperties = s, // Minor hack: If fieldTransforms is undefined, we assume this is an
    // external call and we need to validate the entire path.
    i === void 0 && this.validatePath(), this.fieldTransforms = i || [], this.fieldMask = o || [];
  }
  get path() {
    return this.settings.path;
  }
  get dataSource() {
    return this.settings.dataSource;
  }
  /** Returns a new context with the specified settings overwritten. */
  contextWith(e) {
    return new bB({
      ...this.settings,
      ...e
    }, this.databaseId, this.serializer, this.ignoreUndefinedProperties, this.fieldTransforms, this.fieldMask);
  }
  childContextForField(e) {
    const t = this.path?.child(e), n = this.contextWith({
      path: t,
      arrayElement: !1
    });
    return n.validatePathSegment(e), n;
  }
  childContextForFieldPath(e) {
    const t = this.path?.child(e), n = this.contextWith({
      path: t,
      arrayElement: !1
    });
    return n.validatePath(), n;
  }
  childContextForArray(e) {
    return this.contextWith({
      path: void 0,
      arrayElement: !0
    });
  }
  createError(e) {
    return ho(e, this.settings.methodName, this.settings.hasConverter || !1, this.path, this.settings.targetDoc);
  }
  /** Returns 'true' if 'fieldPath' was traversed when creating this context. */
  contains(e) {
    return this.fieldMask.find(((t) => e.isPrefixOf(t))) !== void 0 || this.fieldTransforms.find(((t) => e.isPrefixOf(t.field))) !== void 0;
  }
  validatePath() {
    if (this.path) for (let e = 0; e < this.path.length; e++) this.validatePathSegment(this.path.get(e));
  }
  validatePathSegment(e) {
    if (e.length === 0) throw this.createError("Document fields must not be empty");
    if (gf(this.dataSource) && qD.test(e)) throw this.createError('Document fields cannot begin and end with "__"');
  }
}
class zD {
  constructor(e, t, n) {
    this.databaseId = e, this.ignoreUndefinedProperties = t, this.serializer = n || So(e);
  }
  /** Creates a new top-level parse context. */
  createContext(e, t, n, s = !1) {
    return new bB({
      dataSource: e,
      methodName: t,
      targetDoc: n,
      path: gt.emptyPath(),
      arrayElement: !1,
      hasConverter: s
    }, this.databaseId, this.serializer, this.ignoreUndefinedProperties);
  }
}
function No(r) {
  const e = r._freezeSettings(), t = So(r._databaseId);
  return new zD(r._databaseId, !!e.ignoreUndefinedProperties, t);
}
function mf(r, e, t, n, s, i = {}) {
  const o = r.createContext(i.merge || i.mergeFields ? 2 : 0, e, t, s);
  NB("Data must be an object, but it was:", o, n);
  const B = Df(n, o);
  let u, c;
  if (i.merge) u = new dt(o.fieldMask), c = o.fieldTransforms;
  else if (i.mergeFields) {
    const C = [];
    for (const f of i.mergeFields) {
      const m = nr(e, f, t);
      if (!o.contains(m)) throw new j(L.INVALID_ARGUMENT, `Field '${m}' is specified in your field mask but missing from your input data.`);
      yf(C, m) || C.push(m);
    }
    u = new dt(C), c = o.fieldTransforms.filter(((f) => u.covers(f.field)));
  } else u = null, c = o.fieldTransforms;
  return new KD(new ze(B), u, c);
}
class Fo extends SB {
  _toFieldTransform(e) {
    if (e.dataSource !== 2) throw e.dataSource === 1 ? e.createError(`${this._methodName}() can only appear at the top level of your update data`) : e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);
    return e.fieldMask.push(e.path), null;
  }
  isEqual(e) {
    return e instanceof Fo;
  }
}
function Ef(r, e, t, n) {
  const s = r.createContext(1, e, t);
  NB("Data must be an object, but it was:", s, n);
  const i = [], o = ze.empty();
  Ln(n, ((u, c) => {
    const C = wf(e, u, t);
    c = Re(c);
    const f = s.childContextForFieldPath(C);
    if (c instanceof Fo)
      i.push(C);
    else {
      const m = vn(c, f);
      m != null && (i.push(C), o.set(C, m));
    }
  }));
  const B = new dt(i);
  return new pf(o, B, s.fieldTransforms);
}
function _f(r, e, t, n, s, i) {
  const o = r.createContext(1, e, t), B = [nr(e, n, t)], u = [s];
  if (i.length % 2 != 0) throw new j(L.INVALID_ARGUMENT, `Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);
  for (let m = 0; m < i.length; m += 2) B.push(nr(e, i[m])), u.push(i[m + 1]);
  const c = [], C = ze.empty();
  for (let m = B.length - 1; m >= 0; --m) if (!yf(c, B[m])) {
    const R = B[m];
    let P = u[m];
    P = Re(P);
    const x = o.childContextForFieldPath(R);
    if (P instanceof Fo)
      c.push(R);
    else {
      const H = vn(P, x);
      H != null && (c.push(R), C.set(R, H));
    }
  }
  const f = new dt(c);
  return new pf(C, f, o.fieldTransforms);
}
function QD(r, e, t, n = !1) {
  return vn(t, r.createContext(n ? 4 : 3, e));
}
function vn(r, e, t) {
  if (If(
    // Unwrap the API type from the Compat SDK. This will return the API type
    // from firestore-exp.
    r = Re(r)
  )) return NB("Unsupported field value:", e, r), Df(r, e);
  if (r instanceof SB)
    return (function(s, i) {
      if (!gf(i.dataSource)) throw i.createError(`${s._methodName}() can only be used with update() and set()`);
      if (!i.path) throw i.createError(`${s._methodName}() is not currently supported inside arrays`);
      const o = s._toFieldTransform(i);
      o && i.fieldTransforms.push(o);
    })(r, e), null;
  if (r === void 0 && e.ignoreUndefinedProperties)
    return null;
  if (
    // If context.path is null we are inside an array and we don't support
    // field mask paths more granular than the top-level array.
    e.path && e.fieldMask.push(e.path), r instanceof Array
  ) {
    if (e.settings.arrayElement && e.dataSource !== 4) throw e.createError("Nested arrays are not supported");
    return (function(s, i) {
      const o = [];
      let B = 0;
      for (const u of s) {
        let c = vn(u, i.childContextForArray(B));
        c == null && // Just include nulls in the array for fields being replaced with a
        // sentinel.
        (c = {
          nullValue: "NULL_VALUE"
        }), o.push(c), B++;
      }
      return {
        arrayValue: {
          values: o
        }
      };
    })(r, e);
  }
  return (function(s, i, o) {
    if ((s = Re(s)) === null) return {
      nullValue: "NULL_VALUE"
    };
    if (typeof s == "number") return IB(i.serializer, s);
    if (typeof s == "boolean") return {
      booleanValue: s
    };
    if (typeof s == "string") return {
      stringValue: s
    };
    if (s instanceof Date) {
      const B = _e.fromDate(s);
      return {
        timestampValue: lo(i.serializer, B)
      };
    }
    if (s instanceof _e) {
      const B = new _e(s.seconds, 1e3 * Math.floor(s.nanoseconds / 1e3));
      return {
        timestampValue: lo(i.serializer, B)
      };
    }
    if (s instanceof Lt) return {
      geoPointValue: {
        latitude: s.latitude,
        longitude: s.longitude
      }
    };
    if (s instanceof ft) return {
      bytesValue: ef(i.serializer, s._byteString)
    };
    if (s instanceof Te) {
      const B = i.databaseId, u = s.firestore._databaseId;
      if (!u.isEqual(B)) throw i.createError(`Document reference is for database ${u.projectId}/${u.database} but should be for database ${B.projectId}/${B.database}`);
      return {
        referenceValue: PB(s.firestore._databaseId || i.databaseId, s._key.path)
      };
    }
    if (s instanceof ot)
      return (function(u, c) {
        const C = u instanceof ot ? u.toArray() : u;
        return {
          mapValue: {
            fields: {
              [RC]: {
                stringValue: vC
              },
              [bs]: {
                arrayValue: {
                  values: C.map(((m) => {
                    if (typeof m != "number") throw c.createError("VectorValues must only contain numeric values.");
                    return Ao(c.serializer, m);
                  }))
                }
              }
            }
          }
        };
      })(s, i);
    if (uf(s)) return s._toProto(i.serializer);
    throw i.createError(`Unsupported field value: ${yo(s)}`);
  })(r, e);
}
function Df(r, e) {
  const t = {};
  return _C(r) ? (
    // If we encounter an empty object, we explicitly add it to the update
    // mask to ensure that the server creates a map entry.
    e.path && e.path.length > 0 && e.fieldMask.push(e.path)
  ) : Ln(r, ((n, s) => {
    const i = vn(s, e.childContextForField(n));
    i != null && (t[n] = i);
  })), {
    mapValue: {
      fields: t
    }
  };
}
function If(r) {
  return !(typeof r != "object" || r === null || r instanceof Array || r instanceof Date || r instanceof _e || r instanceof Lt || r instanceof ft || r instanceof Te || r instanceof SB || r instanceof ot || uf(r));
}
function NB(r, e, t) {
  if (!If(t) || !Zs(t)) {
    const n = yo(t);
    throw n === "an object" ? e.createError(r + " a custom object") : e.createError(r + " " + n);
  }
}
function nr(r, e, t) {
  if (
    // If required, replace the FieldPath Compat class with the firestore-exp
    // FieldPath.
    (e = Re(e)) instanceof ai
  ) return e._internalPath;
  if (typeof e == "string") return wf(r, e);
  throw ho(
    "Field path arguments must be of type string or ",
    r,
    /* hasConverter= */
    !1,
    /* path= */
    void 0,
    t
  );
}
const WD = new RegExp("[~\\*/\\[\\]]");
function wf(r, e, t) {
  if (e.search(WD) >= 0) throw ho(
    `Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,
    r,
    /* hasConverter= */
    !1,
    /* path= */
    void 0,
    t
  );
  try {
    return new ai(...e.split("."))._internalPath;
  } catch {
    throw ho(
      `Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,
      r,
      /* hasConverter= */
      !1,
      /* path= */
      void 0,
      t
    );
  }
}
function ho(r, e, t, n, s) {
  const i = n && !n.isEmpty(), o = s !== void 0;
  let B = `Function ${e}() called with invalid data`;
  t && (B += " (via `toFirestore()`)"), B += ". ";
  let u = "";
  return (i || o) && (u += " (found", i && (u += ` in field ${n}`), o && (u += ` in document ${s}`), u += ")"), new j(L.INVALID_ARGUMENT, B + r + u);
}
function yf(r, e) {
  return r.some(((t) => t.isEqual(e)));
}
function $D(r) {
  return typeof r._readUserData == "function";
}
class We {
  constructor(e) {
    this.optionDefinitions = e;
  }
  _getKnownOptions(e, t) {
    const n = ze.empty();
    for (const s in this.optionDefinitions) if (this.optionDefinitions.hasOwnProperty(s)) {
      const i = this.optionDefinitions[s];
      if (s in e) {
        const o = e[s];
        let B;
        i.nestedOptions && Zs(o) ? B = {
          mapValue: {
            fields: new We(i.nestedOptions).getOptionsProto(t, o)
          }
        } : o && (B = vn(o, t) ?? void 0), B && n.set(gt.fromServerFormat(i.serverName), B);
      }
    }
    return n;
  }
  getOptionsProto(e, t, n) {
    const s = this._getKnownOptions(t, e);
    if (n) {
      const i = new Map(h_(n, ((o, B) => [gt.fromServerFormat(B), o !== void 0 ? vn(o, e) : null])));
      s.setAll(i);
    }
    return s.value.mapValue.fields ?? {};
  }
}
function YD(r) {
  return typeof r == "object" && r !== null && !!("nullValue" in r && (r.nullValue === null || r.nullValue === "NULL_VALUE") || "booleanValue" in r && (r.booleanValue === null || typeof r.booleanValue == "boolean") || "integerValue" in r && (r.integerValue === null || typeof r.integerValue == "number" || typeof r.integerValue == "string") || "doubleValue" in r && (r.doubleValue === null || typeof r.doubleValue == "number") || "timestampValue" in r && (r.timestampValue === null || (function(t) {
    return typeof t == "object" && t !== null && "seconds" in t && (t.seconds === null || typeof t.seconds == "number" || typeof t.seconds == "string") && "nanos" in t && (t.nanos === null || typeof t.nanos == "number");
  })(r.timestampValue)) || "stringValue" in r && (r.stringValue === null || typeof r.stringValue == "string") || "bytesValue" in r && (r.bytesValue === null || r.bytesValue instanceof Uint8Array) || "referenceValue" in r && (r.referenceValue === null || typeof r.referenceValue == "string") || "geoPointValue" in r && (r.geoPointValue === null || (function(t) {
    return typeof t == "object" && t !== null && "latitude" in t && (t.latitude === null || typeof t.latitude == "number") && "longitude" in t && (t.longitude === null || typeof t.longitude == "number");
  })(r.geoPointValue)) || "arrayValue" in r && (r.arrayValue === null || (function(t) {
    return typeof t == "object" && t !== null && !(!("values" in t) || t.values !== null && !Array.isArray(t.values));
  })(r.arrayValue)) || "mapValue" in r && (r.mapValue === null || (function(t) {
    return typeof t == "object" && t !== null && !(!("fields" in t) || t.fields !== null && !Zs(t.fields));
  })(r.mapValue)) || "fieldReferenceValue" in r && (r.fieldReferenceValue === null || typeof r.fieldReferenceValue == "string") || "functionValue" in r && (r.functionValue === null || (function(t) {
    return typeof t == "object" && t !== null && !(!("name" in t) || t.name !== null && typeof t.name != "string" || !("args" in t) || t.args !== null && !Array.isArray(t.args));
  })(r.functionValue)) || "pipelineValue" in r && (r.pipelineValue === null || (function(t) {
    return typeof t == "object" && t !== null && !(!("stages" in t) || t.stages !== null && !Array.isArray(t.stages));
  })(r.pipelineValue)));
}
function XD(r) {
  return new ot(r);
}
function U(r) {
  let e;
  return r instanceof ir ? r : (e = Zs(r) ? sI(r) : r instanceof Array ? iI(r) : Tf(r, void 0), e);
}
function Aa(r) {
  if (r instanceof ir) return r;
  if (r instanceof ot) return Gs(r);
  if (Array.isArray(r)) return Gs(XD(r));
  throw new Error("Unsupported value: " + typeof r);
}
function FB(r) {
  return m_(r) ? tI(r) : U(r);
}
class ir {
  constructor() {
    this._protoValueType = "ProtoValue";
  }
  /**
   * Creates an expression that adds this expression to another expression.
   *
   * @example
   * ```typescript
   * // Add the value of the 'quantity' field and the 'reserve' field.
   * field("quantity").add(field("reserve"));
   * ```
   *
   * @param second - The expression or literal to add to this expression.
   * @param others - Optional additional expressions or literals to add to this expression.
   * @returns A new `Expression` representing the addition operation.
   */
  add(e) {
    return new F("add", [this, U(e)], "add");
  }
  /**
   * Wraps the expression in a [BooleanExpression].
   *
   * @returns A [BooleanExpression] representing the same expression.
   */
  asBoolean() {
    if (this instanceof Pn) return this;
    if (this instanceof Ur) return new Rf(this);
    if (this instanceof Bi) return new rI(this);
    if (this instanceof F) return new Af(this);
    throw new j("invalid-argument", `Conversion of type ${typeof this} to BooleanExpression not supported.`);
  }
  subtract(e) {
    return new F("subtract", [this, U(e)], "subtract");
  }
  /**
   * Creates an expression that multiplies this expression by another expression.
   *
   * @example
   * ```typescript
   * // Multiply the 'quantity' field by the 'price' field
   * field("quantity").multiply(field("price"));
   * ```
   *
   * @param second - The second expression or literal to multiply by.
   * @param others - Optional additional expressions or literals to multiply by.
   * @returns A new `Expression` representing the multiplication operation.
   */
  multiply(e) {
    return new F("multiply", [this, U(e)], "multiply");
  }
  divide(e) {
    return new F("divide", [this, U(e)], "divide");
  }
  mod(e) {
    return new F("mod", [this, U(e)], "mod");
  }
  equal(e) {
    return new F("equal", [this, U(e)], "equal").asBoolean();
  }
  notEqual(e) {
    return new F("not_equal", [this, U(e)], "notEqual").asBoolean();
  }
  lessThan(e) {
    return new F("less_than", [this, U(e)], "lessThan").asBoolean();
  }
  lessThanOrEqual(e) {
    return new F("less_than_or_equal", [this, U(e)], "lessThanOrEqual").asBoolean();
  }
  greaterThan(e) {
    return new F("greater_than", [this, U(e)], "greaterThan").asBoolean();
  }
  greaterThanOrEqual(e) {
    return new F("greater_than_or_equal", [this, U(e)], "greaterThanOrEqual").asBoolean();
  }
  /**
   * Creates an expression that concatenates an array expression with one or more other arrays.
   *
   * @example
   * ```typescript
   * // Combine the 'items' array with another array field.
   * field("items").arrayConcat(field("otherItems"));
   * ```
   * @param secondArray - Second array expression or array literal to concatenate.
   * @param otherArrays - Optional additional array expressions or array literals to concatenate.
   * @returns A new `Expression` representing the concatenated array.
   */
  arrayConcat(e, ...t) {
    const n = [e, ...t].map(((s) => U(s)));
    return new F("array_concat", [this, ...n], "arrayConcat");
  }
  arrayContains(e) {
    return new F("array_contains", [this, U(e)], "arrayContains").asBoolean();
  }
  arrayContainsAll(e) {
    const t = Array.isArray(e) ? new fs(e.map(U), "arrayContainsAll") : e;
    return new F("array_contains_all", [this, t], "arrayContainsAll").asBoolean();
  }
  arrayContainsAny(e) {
    const t = Array.isArray(e) ? new fs(e.map(U), "arrayContainsAny") : e;
    return new F("array_contains_any", [this, t], "arrayContainsAny").asBoolean();
  }
  /**
   * Creates an expression that reverses an array.
   *
   * @example
   * ```typescript
   * // Reverse the value of the 'myArray' field.
   * field("myArray").arrayReverse();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the reversed array.
   */
  arrayReverse() {
    return new F("array_reverse", [this]);
  }
  /**
   * Creates an expression that calculates the length of an array.
   *
   * @example
   * ```typescript
   * // Get the number of items in the 'cart' array
   * field("cart").arrayLength();
   * ```
   *
   * @returns A new `Expression` representing the length of the array.
   */
  arrayLength() {
    return new F("array_length", [this], "arrayLength");
  }
  equalAny(e) {
    const t = Array.isArray(e) ? new fs(e.map(U), "equalAny") : e;
    return new F("equal_any", [this, t], "equalAny").asBoolean();
  }
  notEqualAny(e) {
    const t = Array.isArray(e) ? new fs(e.map(U), "notEqualAny") : e;
    return new F("not_equal_any", [this, t], "notEqualAny").asBoolean();
  }
  /**
   * Creates an expression that checks if a field exists in the document.
   *
   * @example
   * ```typescript
   * // Check if the document has a field named "phoneNumber"
   * field("phoneNumber").exists();
   * ```
   *
   * @returns A new `Expression` representing the 'exists' check.
   */
  exists() {
    return new F("exists", [this], "exists").asBoolean();
  }
  /**
   * Creates an expression that calculates the character length of a string in UTF-8.
   *
   * @example
   * ```typescript
   * // Get the character length of the 'name' field in its UTF-8 form.
   * field("name").charLength();
   * ```
   *
   * @returns A new `Expression` representing the length of the string.
   */
  charLength() {
    return new F("char_length", [this], "charLength");
  }
  like(e) {
    return new F("like", [this, U(e)], "like").asBoolean();
  }
  regexContains(e) {
    return new F("regex_contains", [this, U(e)], "regexContains").asBoolean();
  }
  regexFind(e) {
    return new F("regex_find", [this, U(e)], "regexFind");
  }
  regexFindAll(e) {
    return new F("regex_find_all", [this, U(e)], "regexFindAll");
  }
  regexMatch(e) {
    return new F("regex_match", [this, U(e)], "regexMatch").asBoolean();
  }
  stringContains(e) {
    return new F("string_contains", [this, U(e)], "stringContains").asBoolean();
  }
  startsWith(e) {
    return new F("starts_with", [this, U(e)], "startsWith").asBoolean();
  }
  endsWith(e) {
    return new F("ends_with", [this, U(e)], "endsWith").asBoolean();
  }
  /**
   * Creates an expression that converts a string to lowercase.
   *
   * @example
   * ```typescript
   * // Convert the 'name' field to lowercase
   * field("name").toLower();
   * ```
   *
   * @returns A new `Expression` representing the lowercase string.
   */
  toLower() {
    return new F("to_lower", [this], "toLower");
  }
  /**
   * Creates an expression that converts a string to uppercase.
   *
   * @example
   * ```typescript
   * // Convert the 'title' field to uppercase
   * field("title").toUpper();
   * ```
   *
   * @returns A new `Expression` representing the uppercase string.
   */
  toUpper() {
    return new F("to_upper", [this], "toUpper");
  }
  /**
   * Creates an expression that removes leading and trailing characters from a string or byte array.
   *
   * @example
   * ```typescript
   * // Trim whitespace from the 'userInput' field
   * field("userInput").trim();
   *
   * // Trim quotes from the 'userInput' field
   * field("userInput").trim('"');
   * ```
   * @param valueToTrim - Optional This parameter is treated as a set of characters or bytes that will be
   * trimmed from the input. If not specified, then whitespace will be trimmed.
   * @returns A new `Expression` representing the trimmed string or byte array.
   */
  trim(e) {
    const t = [this];
    return e && t.push(U(e)), new F("trim", t, "trim");
  }
  /**
   * Trims whitespace or a specified set of characters/bytes from the beginning of a string or byte array.
   *
   * @example
   * ```typescript
   * // Trim whitespace from the beginning of the 'userInput' field
   * field("userInput").ltrim();
   *
   * // Trim quotes from the beginning of the 'userInput' field
   * field("userInput").ltrim('"');
   * ```
   *
   * @param valueToTrim - Optional. A string or byte array containing the characters/bytes to trim.
   * If not specified, whitespace will be trimmed.
   * @returns A new `Expression` representing the trimmed string.
   */
  ltrim(e) {
    const t = [this];
    return e && t.push(U(e)), new F("ltrim", t, "ltrim");
  }
  /**
   * Trims whitespace or a specified set of characters/bytes from the end of a string or byte array.
   *
   * @example
   * ```typescript
   * // Trim whitespace from the end of the 'userInput' field
   * field("userInput").rtrim();
   *
   * // Trim quotes from the end of the 'userInput' field
   * field("userInput").rtrim('"');
   * ```
   *
   * @param valueToTrim - Optional. A string or byte array containing the characters/bytes to trim.
   * If not specified, whitespace will be trimmed.
   * @returns A new `Expression` representing the trimmed string or byte array.
   */
  rtrim(e) {
    const t = [this];
    return e && t.push(U(e)), new F("rtrim", t, "rtrim");
  }
  /**
   * Creates an expression that returns the data type of this expression's result, as a string.
   *
   * @remarks
   * This is evaluated on the backend. This means:
   * 1. Generic typed elements (like `array<string>`) evaluate strictly to the primitive `'array'`.
   * 2. Any custom `FirestoreDataConverter` mappings are ignored.
   * 3. For numeric values, the backend does not yield the JavaScript `"number"` type; it evaluates
   *    precisely as `"int64"` or `"float64"`.
   * 4. For date or timestamp objects, the backend evaluates to `"timestamp"`.
   *
   * @example
   * ```typescript
   * // Get the data type of the value in field 'title'
   * field('title').type()
   * ```
   *
   * @returns A new `Expression` representing the data type.
   */
  type() {
    return new F("type", [this]);
  }
  /**
   * Creates an expression that checks if the result of this expression is of the given type.
   *
   * @remarks Null or undefined fields evaluate to skip/error. Use `ifAbsent()` / `isAbsent()` to evaluate missing data.
   * Supported values for `type` are:
   * `'null'`, `'array'`, `'boolean'`, `'bytes'`, `'timestamp'`, `'geo_point'`, `'number'`,
   * `'int32'`, `'int64'`, `'float64'`, `'decimal128'`, `'map'`, `'reference'`, `'string'`,
   * `'vector'`, `'max_key'`, `'min_key'`, `'object_id'`, `'regex'`, `'request_timestamp'`.
   *
   * @example
   * ```typescript
   * // Check if the 'price' field is specifically an integer (not just 'number')
   * field('price').isType('int64');
   * ```
   *
   * @param type - The type to check for.
   * @returns A new `BooleanExpression` that evaluates to true if the expression's result is of the given type, false otherwise.
   */
  isType(e) {
    return new F("is_type", [this, Gs(e)], "isType").asBoolean();
  }
  /**
   * Creates an expression that concatenates string expressions together.
   *
   * @example
   * ```typescript
   * // Combine the 'firstName', " ", and 'lastName' fields into a single string
   * field("firstName").stringConcat(constant(" "), field("lastName"));
   * ```
   *
   * @param secondString - The additional expression or string literal to concatenate.
   * @param otherStrings - Optional additional expressions or string literals to concatenate.
   * @returns A new `Expression` representing the concatenated string.
   */
  stringConcat(e, ...t) {
    const n = [e, ...t].map(U);
    return new F("string_concat", [this, ...n], "stringConcat");
  }
  /**
   * Creates an expression that finds the index of the first occurrence of a substring or byte sequence.
   *
   * @example
   * ```typescript
   * // Find the index of "foo" in the 'text' field
   * field("text").stringIndexOf("foo");
   * ```
   *
   * @param search - The substring or byte sequence to search for.
   * @returns A new `Expression` representing the index of the first occurrence.
   */
  stringIndexOf(e) {
    return new F("string_index_of", [this, U(e)], "stringIndexOf");
  }
  /**
   * Creates an expression that repeats a string or byte array a specified number of times.
   *
   * @example
   * ```typescript
   * // Repeat the 'label' field 3 times
   * field("label").stringRepeat(3);
   * ```
   *
   * @param repetitions - The number of times to repeat the string or byte array.
   * @returns A new `Expression` representing the repeated string or byte array.
   */
  stringRepeat(e) {
    return new F("string_repeat", [this, U(e)], "stringRepeat");
  }
  /**
   * Creates an expression that replaces all occurrences of a substring or byte sequence with a replacement.
   *
   * @example
   * ```typescript
   * // Replace all occurrences of "foo" with "bar" in the 'text' field
   * field("text").stringReplaceAll("foo", "bar");
   * ```
   *
   * @param find - The substring or byte sequence to search for.
   * @param replacement - The replacement string or byte sequence.
   * @returns A new `Expression` representing the string or byte array with replacements.
   */
  stringReplaceAll(e, t) {
    return new F("string_replace_all", [this, U(e), U(t)], "stringReplaceAll");
  }
  /**
   * Creates an expression that replaces the first occurrence of a substring or byte sequence with a replacement.
   *
   * @example
   * ```typescript
   * // Replace the first occurrence of "foo" with "bar" in the 'text' field
   * field("text").stringReplaceOne("foo", "bar");
   * ```
   *
   * @param find - The substring or byte sequence to search for.
   * @param replacement - The replacement string or byte sequence.
   * @returns A new `Expression` representing the string or byte array with the replacement.
   */
  stringReplaceOne(e, t) {
    return new F("string_replace_one", [this, U(e), U(t)], "stringReplaceOne");
  }
  /**
   * Creates an expression that concatenates expression results together.
   *
   * @example
   * ```typescript
   * // Combine the 'firstName', ' ', and 'lastName' fields into a single value.
   * field("firstName").concat(constant(" "), field("lastName"));
   * ```
   *
   * @param second - The additional expression or literal to concatenate.
   * @param others - Optional additional expressions or literals to concatenate.
   * @returns A new `Expression` representing the concatenated value.
   */
  concat(e, ...t) {
    const n = [e, ...t].map(U);
    return new F("concat", [this, ...n], "concat");
  }
  /**
   * Creates an expression that reverses this string expression.
   *
   * @example
   * ```typescript
   * // Reverse the value of the 'myString' field.
   * field("myString").reverse();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the reversed string.
   */
  reverse() {
    return new F("reverse", [this], "reverse");
  }
  /**
   * Filters the array using a provided alias and predicate expression.
   *
   * @example
   * ```typescript
   * // Filter the 'items' array to only include those where the 'price' is greater than 10
   * field("items").arrayFilter('item', greaterThan(variable('item.price'), 10));
   * ```
   *
   * @param alias - The variable name to use for each element.
   * @param filter - The predicate boolean expression to filter by.
   * @returns A new `Expression` representing the filtered array.
   */
  arrayFilter(e, t) {
    return new F("array_filter", [this, U(e), t], "arrayFilter");
  }
  /**
   * Creates an expression that applies a provided transformation to each element in an array.
   *
   * @example
   * ```typescript
   * // Transform the 'scores' array by multiplying each score by 10
   * field("scores").arrayTransform("score", multiply(variable("score"), 10));
   * ```
   *
   * @param elementAlias - The variable name to use for each element.
   * @param transform - The lambda expression used to transform the elements.
   * @returns A new `Expression` representing the arrayTransform operation.
   */
  arrayTransform(e, t) {
    return new F("array_transform", [this, U(e), t], "arrayTransform");
  }
  /**
   * Creates an expression that applies a provided transformation to each element in an array, providing the element's index to the transformation expression.
   *
   * @example
   * ```typescript
   * // Transform the 'scores' array by adding the index to each score
   * field("scores").arrayTransformWithIndex("score", "i", add(variable("score"), variable("i")));
   * ```
   *
   * @param elementAlias - The variable name to use for each element.
   * @param indexAlias - The variable name to use for the current index.
   * @param transform - The lambda expression used to transform the elements.
   * @returns A new `Expression` representing the arrayTransformWithIndex operation.
   */
  arrayTransformWithIndex(e, t, n) {
    return new F("array_transform", [this, U(e), U(t), n], "arrayTransformWithIndex");
  }
  /**
   * Returns a subset of the array.
   *
   * @example
   * ```typescript
   * // Get 5 elements from the 'items' array starting from index 2
   * field("items").arraySlice(2, 5);
   *
   * // Get n number of elements from the 'items' array starting from index 2
   * field("items").arraySlice(2, field("count"));
   * ```
   *
   * @param offset - The starting offset.
   * @param length - The optional length of the slice.
   * @returns A new `Expression` representing the sliced array.
   */
  arraySlice(e, t) {
    const n = [this, U(e)];
    return t !== void 0 && n.push(U(t)), new F("array_slice", n, "arraySlice");
  }
  /**
   * Returns the first element of the array.
   *
   * @example
   * ```typescript
   * // Get the first element of the 'myArray' field.
   * field("myArray").arrayFirst();
   * ```
   *
   * @returns A new `Expression` representing the first element.
   */
  arrayFirst() {
    return new F("array_first", [this], "arrayFirst");
  }
  arrayFirstN(e) {
    return new F("array_first_n", [this, U(e)], "arrayFirstN");
  }
  /**
   * Returns the last element of the array.
   *
   * @example
   * ```typescript
   * // Get the last element of the 'myArray' field.
   * field("myArray").arrayLast();
   * ```
   *
   * @returns A new `Expression` representing the last element.
   */
  arrayLast() {
    return new F("array_last", [this], "arrayLast");
  }
  arrayLastN(e) {
    return new F("array_last_n", [this, U(e)], "arrayLastN");
  }
  /**
   * Returns the maximum value in the array.
   *
   * @example
   * ```typescript
   * // Get the maximum value of the 'myArray' field.
   * field("myArray").arrayMaximum();
   * ```
   *
   * @returns A new `Expression` representing the maximum value.
   */
  arrayMaximum() {
    return new F("maximum", [this], "arrayMaximum");
  }
  arrayMaximumN(e) {
    return new F("maximum_n", [this, U(e)], "arrayMaximumN");
  }
  /**
   * Returns the minimum value in the array.
   *
   * @example
   * ```typescript
   * // Get the minimum value of the 'myArray' field.
   * field("myArray").arrayMinimum();
   * ```
   *
   * @returns A new `Expression` representing the minimum value.
   */
  arrayMinimum() {
    return new F("minimum", [this], "arrayMinimum");
  }
  arrayMinimumN(e) {
    return new F("minimum_n", [this, U(e)], "arrayMinimumN");
  }
  arrayIndexOf(e) {
    return new F("array_index_of", [this, U(e), U("first")], "arrayIndexOf");
  }
  arrayLastIndexOf(e) {
    return new F("array_index_of", [this, U(e), U("last")], "arrayLastIndexOf");
  }
  arrayIndexOfAll(e) {
    return new F("array_index_of_all", [this, U(e)], "arrayIndexOfAll");
  }
  /**
   * Creates an expression that calculates the length of this string expression in bytes.
   *
   * @example
   * ```typescript
   * // Calculate the length of the 'myString' field in bytes.
   * field("myString").byteLength();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the length of the string in bytes.
   */
  byteLength() {
    return new F("byte_length", [this], "byteLength");
  }
  /**
   * Creates an expression that computes the ceiling of a numeric value.
   *
   * @example
   * ```typescript
   * // Compute the ceiling of the 'price' field.
   * field("price").ceil();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the ceiling of the numeric value.
   */
  ceil() {
    return new F("ceil", [this]);
  }
  /**
   * Creates an expression that computes the floor of a numeric value.
   *
   * @example
   * ```typescript
   * // Compute the floor of the 'price' field.
   * field("price").floor();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the floor of the numeric value.
   */
  floor() {
    return new F("floor", [this]);
  }
  /**
   * Creates an expression that computes the absolute value of a numeric value.
   *
   * @example
   * ```typescript
   * // Compute the absolute value of the 'price' field.
   * field("price").abs();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the absolute value of the numeric value.
   */
  abs() {
    return new F("abs", [this]);
  }
  /**
   * Creates an expression that computes e to the power of this expression.
   *
   * @example
   * ```typescript
   * // Compute e to the power of the 'value' field.
   * field("value").exp();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the exp of the numeric value.
   */
  exp() {
    return new F("exp", [this]);
  }
  /**
   * Accesses a value from a map (object) field using the provided key.
   *
   * @example
   * ```typescript
   * // Get the 'city' value from the 'address' map field
   * field("address").mapGet("city");
   * ```
   *
   * @param subfield - The key to access in the map.
   * @returns A new `Expression` representing the value associated with the given key in the map.
   */
  mapGet(e) {
    return new F("map_get", [this, Gs(e)], "mapGet");
  }
  /**
   * Creates an expression that returns a new map with the specified entries added or updated.
   *
   * @remarks
   * Note that `mapSet` only performs shallow updates to the map. Setting a value to `null`
   * will retain the key with a `null` value. To remove a key entirely, use `mapRemove`.
   *
   * @example
   * ```typescript
   * // Set the 'city' to "San Francisco" in the 'address' map
   * field("address").mapSet("city", "San Francisco");
   * ```
   *
   * @param key - The key to set. Must be a string or a constant string expression.
   * @param value - The value to set.
   * @param moreKeyValues - Additional key-value pairs to set.
   * @returns A new `Expression` representing the map with the entries set.
   */
  mapSet(e, t, ...n) {
    const s = [this, U(e), U(t), ...n.map(U)];
    return new F("map_set", s, "mapSet");
  }
  /**
   * Creates an expression that returns the keys of a map.
   *
   * @remarks
   * While the backend generally preserves insertion order, relying on the
   * order of the output array is not guaranteed and should be avoided.
   *
   * @example
   * ```typescript
   * // Get the keys of the 'address' map
   * field("address").mapKeys();
   * ```
   *
   * @returns A new `Expression` representing the keys of the map.
   */
  mapKeys() {
    return new F("map_keys", [this], "mapKeys");
  }
  /**
   * Creates an expression that returns the values of a map.
   *
   * @remarks
   * While the backend generally preserves insertion order, relying on the
   * order of the output array is not guaranteed and should be avoided.
   *
   * @example
   * ```typescript
   * // Get the values of the 'address' map
   * field("address").mapValues();
   * ```
   *
   * @returns A new `Expression` representing the values of the map.
   */
  mapValues() {
    return new F("map_values", [this], "mapValues");
  }
  /**
   * Creates an expression that returns the entries of a map as an array of maps,
   * where each map contains a `"k"` property for the key and a `"v"` property for the value.
   * For example: `[{ k: "key1", v: "value1" }, ...]`.
   *
   * @example
   * ```typescript
   * // Get the entries of the 'address' map
   * field("address").mapEntries();
   * ```
   *
   * @returns A new `Expression` representing the entries of the map.
   */
  mapEntries() {
    return new F("map_entries", [this], "mapEntries");
  }
  /**
   * @public
   * Creates an expression that returns the value of a field from the document that results from the evaluation of this expression.
   *
   * @example
   * ```typescript
   * // Get the value of the "city" field in the "address" document.
   * field("address").getField("city")
   * ```
   *
   * @param key The field to access in the document.
   * @returns A new `Expression` representing the value of the field in the document.
   */
  getField(e) {
    return new F("get_field", [this, U(e)], "get_field");
  }
  /**
   * Creates an aggregation that counts the number of stage inputs with valid evaluations of the
   * expression or field.
   *
   * @example
   * ```typescript
   * // Count the total number of products
   * field("productId").count().as("totalProducts");
   * ```
   *
   * @returns A new `AggregateFunction` representing the 'count' aggregation.
   */
  count() {
    return Ct._create("count", [this], "count");
  }
  /**
   * Creates an aggregation that calculates the sum of a numeric field across multiple stage inputs.
   *
   * @example
   * ```typescript
   * // Calculate the total revenue from a set of orders
   * field("orderAmount").sum().as("totalRevenue");
   * ```
   *
   * @returns A new `AggregateFunction` representing the 'sum' aggregation.
   */
  sum() {
    return Ct._create("sum", [this], "sum");
  }
  /**
   * Creates an aggregation that calculates the average (mean) of a numeric field across multiple
   * stage inputs.
   *
   * @example
   * ```typescript
   * // Calculate the average age of users
   * field("age").average().as("averageAge");
   * ```
   *
   * @returns A new `AggregateFunction` representing the 'average' aggregation.
   */
  average() {
    return Ct._create("average", [this], "average");
  }
  /**
   * Creates an aggregation that finds the minimum value of a field across multiple stage inputs.
   *
   * @example
   * ```typescript
   * // Find the lowest price of all products
   * field("price").minimum().as("lowestPrice");
   * ```
   *
   * @returns A new `AggregateFunction` representing the 'minimum' aggregation.
   */
  minimum() {
    return Ct._create("minimum", [this], "minimum");
  }
  /**
   * Creates an aggregation that finds the maximum value of a field across multiple stage inputs.
   *
   * @example
   * ```typescript
   * // Find the highest score in a leaderboard
   * field("score").maximum().as("highestScore");
   * ```
   *
   * @returns A new `AggregateFunction` representing the 'maximum' aggregation.
   */
  maximum() {
    return Ct._create("maximum", [this], "maximum");
  }
  /**
   * Creates an aggregation that finds the first value of an expression across multiple stage inputs.
   *
   * @example
   * ```typescript
   * // Find the first value of the 'rating' field
   * field("rating").first().as("firstRating");
   * ```
   *
   * @returns A new `AggregateFunction` representing the 'first' aggregation.
   */
  first() {
    return Ct._create("first", [this], "first");
  }
  /**
   * Creates an aggregation that finds the last value of an expression across multiple stage inputs.
   *
   * @example
   * ```typescript
   * // Find the last value of the 'rating' field
   * field("rating").last().as("lastRating");
   * ```
   *
   * @returns A new `AggregateFunction` representing the 'last' aggregation.
   */
  last() {
    return Ct._create("last", [this], "last");
  }
  /**
   * Creates an aggregation that collects all values of an expression across multiple stage inputs
   * into an array.
   *
   * @remarks
   * If the expression resolves to an absent value, it is converted to `null`.
   * The order of elements in the output array is not stable and shouldn't be relied upon.
   *
   * @example
   * ```typescript
   * // Collect all tags from books into an array
   * field("tags").arrayAgg().as("allTags");
   * ```
   *
   * @returns A new `AggregateFunction` representing the 'array_agg' aggregation.
   */
  arrayAgg() {
    return Ct._create("array_agg", [this], "arrayAgg");
  }
  /**
   * Creates an aggregation that collects all distinct values of an expression across multiple stage
   * inputs into an array.
   *
   * @remarks
   * If the expression resolves to an absent value, it is converted to `null`.
   * The order of elements in the output array is not stable and shouldn't be relied upon.
   *
   * @example
   * ```typescript
   * // Collect all distinct tags from books into an array
   * field("tags").arrayAggDistinct().as("allDistinctTags");
   * ```
   *
   * @returns A new `AggregateFunction` representing the 'array_agg_distinct' aggregation.
   */
  arrayAggDistinct() {
    return Ct._create("array_agg_distinct", [this], "arrayAggDistinct");
  }
  /**
   * Creates an aggregation that counts the number of distinct values of the expression or field.
   *
   * @example
   * ```typescript
   * // Count the distinct number of products
   * field("productId").countDistinct().as("distinctProducts");
   * ```
   *
   * @returns A new `AggregateFunction` representing the 'count_distinct' aggregation.
   */
  countDistinct() {
    return Ct._create("count_distinct", [this], "countDistinct");
  }
  /**
   * Creates an expression that returns the larger value between this expression and another expression, based on Firestore's value type ordering.
   *
   * @example
   * ```typescript
   * // Returns the larger value between the 'timestamp' field and the current timestamp.
   * field("timestamp").logicalMaximum(currentTimestamp());
   * ```
   *
   * @param second - The second expression or literal to compare with.
   * @param others - Optional additional expressions or literals to compare with.
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the logical maximum operation.
   */
  logicalMaximum(e, ...t) {
    const n = [e, ...t];
    return new F("maximum", [this, ...n.map(U)], "logicalMaximum");
  }
  /**
   * Creates an expression that returns the smaller value between this expression and another expression, based on Firestore's value type ordering.
   *
   * @example
   * ```typescript
   * // Returns the smaller value between the 'timestamp' field and the current timestamp.
   * field("timestamp").logicalMinimum(currentTimestamp());
   * ```
   *
   * @param second - The second expression or literal to compare with.
   * @param others - Optional additional expressions or literals to compare with.
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the logical minimum operation.
   */
  logicalMinimum(e, ...t) {
    const n = [e, ...t];
    return new F("minimum", [this, ...n.map(U)], "minimum");
  }
  /**
   * Creates an expression that calculates the length (number of dimensions) of this Firestore Vector expression.
   *
   * @example
   * ```typescript
   * // Get the vector length (dimension) of the field 'embedding'.
   * field("embedding").vectorLength();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the length of the vector.
   */
  vectorLength() {
    return new F("vector_length", [this], "vectorLength");
  }
  cosineDistance(e) {
    return new F("cosine_distance", [this, Aa(e)], "cosineDistance");
  }
  dotProduct(e) {
    return new F("dot_product", [this, Aa(e)], "dotProduct");
  }
  euclideanDistance(e) {
    return new F("euclidean_distance", [this, Aa(e)], "euclideanDistance");
  }
  /**
   * Creates an expression that interprets this expression as the number of microseconds since the Unix epoch (1970-01-01 00:00:00 UTC)
   * and returns a timestamp.
   *
   * @example
   * ```typescript
   * // Interpret the 'microseconds' field as microseconds since epoch.
   * field("microseconds").unixMicrosToTimestamp();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the timestamp.
   */
  unixMicrosToTimestamp() {
    return new F("unix_micros_to_timestamp", [this], "unixMicrosToTimestamp");
  }
  /**
   * Creates an expression that converts this timestamp expression to the number of microseconds since the Unix epoch (1970-01-01 00:00:00 UTC).
   *
   * @example
   * ```typescript
   * // Convert the 'timestamp' field to microseconds since epoch.
   * field("timestamp").timestampToUnixMicros();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the number of microseconds since epoch.
   */
  timestampToUnixMicros() {
    return new F("timestamp_to_unix_micros", [this], "timestampToUnixMicros");
  }
  /**
   * Creates an expression that interprets this expression as the number of milliseconds since the Unix epoch (1970-01-01 00:00:00 UTC)
   * and returns a timestamp.
   *
   * @example
   * ```typescript
   * // Interpret the 'milliseconds' field as milliseconds since epoch.
   * field("milliseconds").unixMillisToTimestamp();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the timestamp.
   */
  unixMillisToTimestamp() {
    return new F("unix_millis_to_timestamp", [this], "unixMillisToTimestamp");
  }
  /**
   * Creates an expression that converts this timestamp expression to the number of milliseconds since the Unix epoch (1970-01-01 00:00:00 UTC).
   *
   * @example
   * ```typescript
   * // Convert the 'timestamp' field to milliseconds since epoch.
   * field("timestamp").timestampToUnixMillis();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the number of milliseconds since epoch.
   */
  timestampToUnixMillis() {
    return new F("timestamp_to_unix_millis", [this], "timestampToUnixMillis");
  }
  /**
   * Creates an expression that interprets this expression as the number of seconds since the Unix epoch (1970-01-01 00:00:00 UTC)
   * and returns a timestamp.
   *
   * @example
   * ```typescript
   * // Interpret the 'seconds' field as seconds since epoch.
   * field("seconds").unixSecondsToTimestamp();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the timestamp.
   */
  unixSecondsToTimestamp() {
    return new F("unix_seconds_to_timestamp", [this], "unixSecondsToTimestamp");
  }
  /**
   * Creates an expression that converts this timestamp expression to the number of seconds since the Unix epoch (1970-01-01 00:00:00 UTC).
   *
   * @example
   * ```typescript
   * // Convert the 'timestamp' field to seconds since epoch.
   * field("timestamp").timestampToUnixSeconds();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the number of seconds since epoch.
   */
  timestampToUnixSeconds() {
    return new F("timestamp_to_unix_seconds", [this], "timestampToUnixSeconds");
  }
  timestampAdd(e, t) {
    return new F("timestamp_add", [this, U(e), U(t)], "timestampAdd");
  }
  timestampSubtract(e, t) {
    return new F("timestamp_subtract", [this, U(e), U(t)], "timestampSubtract");
  }
  timestampDiff(e, t) {
    return new F("timestamp_diff", [this, FB(e), U(t)], "timestampDiff");
  }
  timestampExtract(e, t) {
    const n = [this, U(e)];
    return t && n.push(U(t)), new F("timestamp_extract", n, "timestampExtract");
  }
  /**
   *
   * Creates an expression that returns the document ID from a path.
   *
   * @example
   * ```typescript
   * // Get the document ID from a path.
   * field("__path__").documentId();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the documentId operation.
   */
  documentId() {
    return new F("document_id", [this], "documentId");
  }
  /**
   *
   * Creates an expression that returns the parent document reference of a document reference.
   *
   * @example
   * ```typescript
   * // Get the parent document reference of a document reference.
   * field("__path__").parent();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the parent operation.
   */
  parent() {
    return new F("parent", [this], "parent");
  }
  substring(e, t) {
    const n = U(e);
    return new F("substring", t === void 0 ? [this, n] : [this, n, U(t)], "substring");
  }
  arrayGet(e) {
    return new F("array_get", [this, U(e)], "arrayGet");
  }
  /**
   *
   * Creates an expression that checks if a given expression produces an error.
   *
   * @example
   * ```typescript
   * // Check if the result of a calculation is an error
   * field("title").arrayContains(1).isError();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#BooleanExpression} representing the 'isError' check.
   */
  isError() {
    return new F("is_error", [this], "isError").asBoolean();
  }
  ifError(e) {
    const t = new F("if_error", [this, U(e)], "ifError");
    return e instanceof Pn ? t.asBoolean() : t;
  }
  /**
   *
   * Creates an expression that returns `true` if the result of this expression
   * is absent. Otherwise, returns `false` even if the value is `null`.
   *
   * @example
   * ```typescript
   * // Check if the field `value` is absent.
   * field("value").isAbsent();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#BooleanExpression} representing the 'isAbsent' check.
   */
  isAbsent() {
    return new F("is_absent", [this], "isAbsent").asBoolean();
  }
  mapRemove(e) {
    return new F("map_remove", [this, U(e)], "mapRemove");
  }
  /**
   *
   * Creates an expression that merges multiple map values.
   *
   * @example
   * ```
   * // Merges the map in the settings field with, a map literal, and a map in
   * // that is conditionally returned by another expression
   * field('settings').mapMerge({ enabled: true }, conditional(field('isAdmin'), { admin: true}, {})
   * ```
   *
   * @param secondMap - A required second map to merge. Represented as a literal or
   * an expression that returns a map.
   * @param otherMaps - Optional additional maps to merge. Each map is represented
   * as a literal or an expression that returns a map.
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'mapMerge' operation.
   */
  mapMerge(e, ...t) {
    const n = U(e), s = t.map(U);
    return new F("map_merge", [this, n, ...s], "mapMerge");
  }
  pow(e) {
    return new F("pow", [this, U(e)]);
  }
  trunc(e) {
    return e === void 0 ? new F("trunc", [this]) : new F("trunc", [this, U(e)], "trunc");
  }
  round(e) {
    return e === void 0 ? new F("round", [this]) : new F("round", [this, U(e)], "round");
  }
  /**
   * Creates an expression that returns the collection ID from a path.
   *
   * @example
   * ```typescript
   * // Get the collection ID from a path.
   * field("__path__").collectionId();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the collectionId operation.
   */
  collectionId() {
    return new F("collection_id", [this]);
  }
  /**
   * Creates an expression that calculates the length of a string, array, map, vector, or bytes.
   *
   * @example
   * ```typescript
   * // Get the length of the 'name' field.
   * field("name").length();
   *
   * // Get the number of items in the 'cart' array.
   * field("cart").length();
   * ```
   *
   * @returns A new `Expression` representing the length of the string, array, map, vector, or bytes.
   */
  length() {
    return new F("length", [this]);
  }
  /**
   * Creates an expression that computes the natural logarithm of a numeric value.
   *
   * @example
   * ```typescript
   * // Compute the natural logarithm of the 'value' field.
   * field("value").ln();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the natural logarithm of the numeric value.
   */
  ln() {
    return new F("ln", [this]);
  }
  /**
   * Creates an expression that computes the square root of a numeric value.
   *
   * @example
   * ```typescript
   * // Compute the square root of the 'value' field.
   * field("value").sqrt();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the square root of the numeric value.
   */
  sqrt() {
    return new F("sqrt", [this]);
  }
  /**
   * Creates an expression that reverses a string.
   *
   * @example
   * ```typescript
   * // Reverse the value of the 'myString' field.
   * field("myString").stringReverse();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the reversed string.
   */
  stringReverse() {
    return new F("string_reverse", [this]);
  }
  ifAbsent(e) {
    return new F("if_absent", [this, U(e)], "ifAbsent");
  }
  ifNull(e) {
    return new F("if_null", [this, U(e)], "ifNull");
  }
  /**
   * Creates an expression that returns the first non-null, non-absent argument, without evaluating
   * the rest of the arguments. When all arguments are null or absent, returns the last argument.
   *
   * @example
   * ```typescript
   * // Returns the value of the first non-null, non-absent field among 'preferredName', 'fullName',
   * // or the last argument if all previous fields are null.
   * field("preferredName").coalesce(field("fullName"), "Anonymous");
   * ```
   *
   * @param replacement - The value to use if this expression evaluates to null.
   * @param others - Optional additional values to check if previous values are null.
   * @returns A new `Expression` representing the coalesce operation.
   */
  coalesce(e, ...t) {
    return new F("coalesce", [this, U(e), ...t.map(U)], "coalesce");
  }
  join(e) {
    return new F("join", [this, U(e)], "join");
  }
  /**
   * Creates an expression that computes the base-10 logarithm of a numeric value.
   *
   * @example
   * ```typescript
   * // Compute the base-10 logarithm of the 'value' field.
   * field("value").log10();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the base-10 logarithm of the numeric value.
   */
  log10() {
    return new F("log10", [this]);
  }
  /**
   * Creates an expression that computes the sum of the elements in an array.
   *
   * @example
   * ```typescript
   * // Compute the sum of the elements in the 'scores' field.
   * field("scores").arraySum();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the sum of the elements in the array.
   */
  arraySum() {
    return new F("sum", [this]);
  }
  split(e) {
    return new F("split", [this, U(e)]);
  }
  timestampTruncate(e, t) {
    const n = [this, U(e)];
    return t && n.push(U(t)), new F("timestamp_trunc", n);
  }
  // TODO(search) enable with backend support
  // /**
  //  * Evaluates if the result of this `expression` is between
  //  * the `lowerBound` (inclusive) and `upperBound` (inclusive).
  //  *
  //  * @example
  //  * ```
  //  * // Evaluate if the 'tireWidth' is between 2.2 and 2.4
  //  * field('tireWidth').between(constant(2.2), constant(2.4))
  //  *
  //  * // This is functionally equivalent to
  //  * and(field('tireWidth').greaterThanOrEqual(contant(2.2)), field('tireWidth').lessThanOrEqual(constant(2.4)))
  //  * ```
  //  *
  //  * @param lowerBound - Lower bound (inclusive) of the range.
  //  * @param upperBound - Upper bound (inclusive) of the range.
  //  */
  // between(lowerBound: Expression, upperBound: Expression): BooleanExpression;
  // /**
  //  * Evaluates if the result of this `expression` is between
  //  * the `lowerBound` (inclusive) and `upperBound` (inclusive).
  //  *
  //  * @example
  //  * ```
  //  * // Evaluate if the 'tireWidth' is between 2.2 and 2.4
  //  * field('tireWidth').between(2.2, 2.4)
  //  *
  //  * // This is functionally equivalent to
  //  * and(field('tireWidth').greaterThanOrEqual(2.2), field('tireWidth').lessThanOrEqual(2.4))
  //  * ```
  //  *
  //  * @param lowerBound - Lower bound (inclusive) of the range.
  //  * @param upperBound - Upper bound (inclusive) of the range.
  //  */
  // between(lowerBound: unknown, upperBound: unknown): BooleanExpression;
  // between(lowerBound: unknown, upperBound: unknown): BooleanExpression {
  //   return new FunctionExpression('between', [
  //     this,
  //     valueToDefaultExpr(lowerBound),
  //     valueToDefaultExpr(upperBound)
  //   ]).asBoolean();
  // }
  // TODO(search) enable with backend support
  // /**
  //  * Evaluates to an HTML-formatted text snippet that renders terms matching
  //  * the search query in `<b>bold</b>`.
  //  *
  //  * @remarks This Expression can only be used within a `search` stage.
  //  *
  //  * @param rquery Define the search query using the search domain-specific language (DSL).
  //  */
  // snippet(rquery: string): Expression;
  // /**
  //  * Evaluates to an HTML-formatted text snippet that renders terms matching
  //  * the search query in `<b>bold</b>`.
  //  *
  //  * @remarks This Expression can only be used within a `search` stage.
  //  *
  //  * @param options Define how snippeting behaves.
  //  */
  // snippet(options: SnippetOptions): Expression;
  // snippet(queryOrOptions: string | SnippetOptions): Expression {
  //   const options: SnippetOptions = isString(queryOrOptions)
  //     ? { rquery: queryOrOptions }
  //     : queryOrOptions;
  //   const rquery = options.rquery;
  //   const internalOptions = {
  //     maxSnippetWidth: options.maxSnippetWidth,
  //     maxSnippets: options.maxSnippets,
  //     separator: options.separator
  //   };
  //   return new SnippetExpression([this, constant(rquery)], internalOptions);
  // }
  // TODO(new-expression): Add new expression method definitions above this line
  /**
   * Creates an {@link @firebase/firestore/pipelines#Ordering} that sorts documents in ascending order based on this expression.
   *
   * @example
   * ```typescript
   * // Sort documents by the 'name' field in ascending order
   * firestore.pipeline().collection("users")
   *   .sort(field("name").ascending());
   * ```
   *
   * @returns A new `Ordering` for ascending sorting.
   */
  ascending() {
    return oI(this);
  }
  /**
   * Creates an {@link @firebase/firestore/pipelines#Ordering} that sorts documents in descending order based on this expression.
   *
   * @example
   * ```typescript
   * // Sort documents by the 'createdAt' field in descending order
   * firestore.pipeline().collection("users")
   *   .sort(field("createdAt").descending());
   * ```
   *
   * @returns A new `Ordering` for descending sorting.
   */
  descending() {
    return aI(this);
  }
  /**
   * Assigns an alias to this expression.
   *
   * Aliases are useful for renaming fields in the output of a stage or for giving meaningful
   * names to calculated values.
   *
   * @example
   * ```typescript
   * // Calculate the total price and assign it the alias "totalPrice" and add it to the output.
   * firestore.pipeline().collection("items")
   *   .addFields(field("price").multiply(field("quantity")).as("totalPrice"));
   * ```
   *
   * @param name - The alias to assign to this expression.
   * @returns A new {@link @firebase/firestore/pipelines#AliasedExpression} that wraps this
   *     expression and associates it with the provided alias.
   */
  as(e) {
    return new eI(this, e, "as");
  }
}
class Ct {
  constructor(e, t) {
    this.name = e, this.params = t, this.exprType = "AggregateFunction", this._protoValueType = "ProtoValue";
  }
  /**
   * @internal
   * @private
   */
  static _create(e, t, n) {
    const s = new Ct(e, t);
    return s._methodName = n, s;
  }
  /**
   * Assigns an alias to this AggregateFunction. The alias specifies the name that
   * the aggregated value will have in the output document.
   *
   * @example
   * ```typescript
   * // Calculate the average price of all items and assign it the alias "averagePrice".
   * firestore.pipeline().collection("items")
   *   .aggregate(field("price").average().as("averagePrice"));
   * ```
   *
   * @param name - The alias to assign to this AggregateFunction.
   * @returns A new {@link @firebase/firestore/pipelines#AliasedAggregate} that wraps this
   *     AggregateFunction and associates it with the provided alias.
   */
  as(e) {
    return new ZD(this, e, "as");
  }
  /**
   * @private
   * @internal
   */
  _toProto(e) {
    return {
      functionValue: {
        name: this.name,
        args: this.params.map(((t) => t._toProto(e)))
      }
    };
  }
  /**
   * @private
   * @internal
   */
  _readUserData(e) {
    e = this._methodName ? e.contextWith({
      methodName: this._methodName
    }) : e, this.params.forEach(((t) => t._readUserData(e)));
  }
}
class ZD {
  constructor(e, t, n) {
    this.aggregate = e, this.alias = t, this._methodName = n;
  }
  /**
   * @private
   * @internal
   */
  _readUserData(e) {
    this.aggregate._readUserData(e);
  }
}
class eI {
  constructor(e, t, n) {
    this.expr = e, this.alias = t, this._methodName = n, this.exprType = "AliasedExpression", this.selectable = !0;
  }
  /**
   * @private
   * @internal
   */
  _readUserData(e) {
    this.expr._readUserData(e);
  }
}
class fs extends ir {
  constructor(e, t) {
    super(), this.ur = e, this._methodName = t, this.expressionType = "ListOfExpressions";
  }
  /**
   * @private
   * @internal
   */
  _toProto(e) {
    return {
      arrayValue: {
        values: this.ur.map(((t) => t._toProto(e)))
      }
    };
  }
  /**
   * @private
   * @internal
   */
  _readUserData(e) {
    this.ur.forEach(((t) => t._readUserData(e)));
  }
}
class Bi extends ir {
  /**
   * @internal
   * @private
   * @hideconstructor
   * @param fieldPath
   */
  constructor(e, t) {
    super(), this.fieldPath = e, this._methodName = t, this.expressionType = "Field", this.selectable = !0;
  }
  get _fieldPath() {
    return this.fieldPath;
  }
  get fieldName() {
    return this.fieldPath.canonicalString();
  }
  get alias() {
    return this.fieldName;
  }
  get expr() {
    return this;
  }
  // TODO(search) enable with backend support
  // /**
  //  * Perform a full-text search on this field.
  //  *
  //  * @remarks This Expression can only be used within a `search` stage.
  //  *
  //  * @param rquery Define the search query using the search domain-specific language (DSL).
  //  */
  // matches(rquery: string | Expression): BooleanExpression {
  //   return new FunctionExpression(
  //     'matches',
  //     [this, valueToDefaultExpr(rquery)],
  //     'matches'
  //   ).asBoolean();
  // }
  /**
   * @beta
   * Evaluates to the distance in meters between the location specified
   * by this field and the query location.
   *
   * @remarks This Expression can only be used within a `search` stage.
   *
   * @param location - Compute distance to this GeoPoint.
   */
  geoDistance(e) {
    return new F("geo_distance", [this, U(e)], "geoDistance");
  }
  /**
   * @private
   * @internal
   */
  _toProto(e) {
    return {
      fieldReferenceValue: this.fieldPath.canonicalString()
    };
  }
  /**
   * @private
   * @internal
   */
  _readUserData(e) {
  }
}
function tI(r) {
  return nI(r, "field");
}
function nI(r, e) {
  return new Bi(typeof r == "string" ? vr === r ? gD()._internalPath : nr("field", r) : r._internalPath, e);
}
class Ur extends ir {
  /**
   * @private
   * @internal
   * @hideconstructor
   * @param value - The value of the constant.
   */
  constructor(e, t) {
    super(), this.value = e, this._methodName = t, this.expressionType = "Constant";
  }
  /**
   * @private
   * @internal
   */
  static _fromProto(e) {
    const t = new Ur(e, void 0);
    return t._protoValue = e, t;
  }
  /**
   * @private
   * @internal
   */
  _toProto(e) {
    return Q(this._protoValue !== void 0, 237), this._protoValue;
  }
  _getValue() {
    return this._protoValue;
  }
  /**
   * @private
   * @internal
   */
  _readUserData(e) {
    e = this._methodName ? e.contextWith({
      methodName: this._methodName
    }) : e, YD(this._protoValue) || (this._protoValue = vn(this.value, e));
  }
}
function Gs(r, e) {
  return Tf(r, "constant");
}
function Tf(r, e) {
  const t = new Ur(r, e);
  return typeof r == "boolean" ? new Rf(t) : t;
}
class F extends ir {
  /**
   * @hideconstructor
   */
  constructor(e, t, n, s) {
    super(), this.name = e, this.params = t, this.expressionType = "Function", /**
     * @private
     * @internal
     */
    this._optionsProto = void 0, n !== void 0 && (this._methodName = n), s !== void 0 && (this._options = s);
  }
  /**
   * @private
   * @internal
   */
  get _optionsUtil() {
    return new We({});
  }
  /**
   * @private
   * @internal
   */
  _toProto(e) {
    const t = {
      functionValue: {
        name: this.name,
        args: this.params.map(((n) => n._toProto(e)))
      }
    };
    return this._optionsProto && (t.functionValue.options = this._optionsProto), t;
  }
  /**
   * @private
   * @internal
   */
  _readUserData(e) {
    e = this._methodName ? e.contextWith({
      methodName: this._methodName
    }) : e, this.params.forEach(((t) => t._readUserData(e))), this._options && (this._optionsProto = this._optionsUtil.getOptionsProto(e, this._options));
  }
}
class Pn extends ir {
  get _methodName() {
    return this._expr._methodName;
  }
  /**
   * Creates an aggregation that finds the count of input documents satisfying
   * this boolean expression.
   *
   * @example
   * ```typescript
   * // Find the count of documents with a score greater than 90
   * field("score").greaterThan(90).countIf().as("highestScore");
   * ```
   *
   * @returns A new `AggregateFunction` representing the 'countIf' aggregation.
   */
  countIf() {
    return Ct._create("count_if", [this], "countIf");
  }
  /**
   * Creates an expression that negates this boolean expression.
   *
   * @example
   * ```typescript
   * // Find documents where the 'tags' field does not contain 'completed'
   * field("tags").arrayContains("completed").not();
   * ```
   *
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the negated filter condition.
   */
  not() {
    return new F("not", [this], "not").asBoolean();
  }
  /**
   * Creates a conditional expression that evaluates to the 'then' expression
   * if `this` expression evaluates to `true`,
   * or evaluates to the 'else' expression if `this` expressions evaluates `false`.
   *
   * @example
   * ```typescript
   * // If 'age' is greater than 18, return "Adult"; otherwise, return "Minor".
   * field("age").greaterThanOrEqual(18).conditional(constant("Adult"), constant("Minor"));
   * ```
   *
   * @param thenExpr - The expression to evaluate if the condition is true.
   * @param elseExpr - The expression to evaluate if the condition is false.
   * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the conditional expression.
   */
  conditional(e, t) {
    return new F("conditional", [this, e, t], "conditional");
  }
  ifError(e) {
    const t = U(e), n = new F("if_error", [this, t], "ifError");
    return t instanceof Pn ? n.asBoolean() : n;
  }
  /**
   * @private
   * @internal
   */
  _toProto(e) {
    return this._expr._toProto(e);
  }
  /**
   * @private
   * @internal
   */
  _readUserData(e) {
    this._expr._readUserData(e);
  }
}
class Af extends Pn {
  constructor(e) {
    super(), this._expr = e, this.expressionType = "Function";
  }
}
class Rf extends Pn {
  constructor(e) {
    super(), this._expr = e, this.expressionType = "Constant";
  }
  _getValue() {
    return this._expr._getValue();
  }
}
class rI extends Pn {
  constructor(e) {
    super(), this._expr = e, this.expressionType = "Field";
  }
}
function sI(r, e) {
  const t = [];
  for (const n in r) if (Object.prototype.hasOwnProperty.call(r, n)) {
    const s = r[n];
    t.push(Gs(n)), t.push(U(s));
  }
  return new F("map", t, "map");
}
function iI(r) {
  return (function(t, n) {
    return new F("array", t.map(((s) => U(s))), n);
  })(r, "array");
}
function oI(r) {
  return new vf(FB(r), "ascending", "ascending");
}
function aI(r) {
  return new vf(FB(r), "descending", "descending");
}
class vf {
  constructor(e, t, n) {
    this.expr = e, this.direction = t, this._methodName = n, this._protoValueType = "ProtoValue";
  }
  /**
   * @private
   * @internal
   */
  _toProto(e) {
    return {
      mapValue: {
        fields: {
          direction: cf(this.direction),
          expression: this.expr._toProto(e)
        }
      }
    };
  }
  /**
   * @private
   * @internal
   */
  _readUserData(e) {
    this.expr._readUserData(e);
  }
}
class Et {
  constructor(e) {
    this.optionsProto = void 0, { rawOptions: this.rawOptions, ...this.knownOptions } = e;
  }
  _readUserData(e) {
    this.optionsProto = this._optionsUtil.getOptionsProto(e, this.knownOptions, this.rawOptions);
  }
  _toProto(e) {
    return {
      name: this._name,
      options: this.optionsProto
    };
  }
}
class Pf extends Et {
  get _name() {
    return "add_fields";
  }
  get _optionsUtil() {
    return new We({});
  }
  constructor(e, t) {
    super(t), this.fields = e;
  }
  _toProto(e) {
    return {
      ...super._toProto(e),
      args: [Ms(e, this.fields)]
    };
  }
  _readUserData(e) {
    super._readUserData(e), Sn(this.fields, e);
  }
}
class Sf extends Et {
  get _name() {
    return "aggregate";
  }
  get _optionsUtil() {
    return new We({});
  }
  constructor(e, t, n) {
    super(n), this.groups = e, this.accumulators = t;
  }
  /**
   * @internal
   * @private
   */
  _toProto(e) {
    return {
      ...super._toProto(e),
      args: [Ms(e, this.accumulators), Ms(e, this.groups)]
    };
  }
  _readUserData(e) {
    super._readUserData(e), Sn(this.groups, e), Sn(this.accumulators, e);
  }
}
class Of extends Et {
  get _name() {
    return "distinct";
  }
  get _optionsUtil() {
    return new We({});
  }
  constructor(e, t) {
    super(t), this.groups = e;
  }
  /**
   * @internal
   * @private
   */
  _toProto(e) {
    return {
      ...super._toProto(e),
      args: [Ms(e, this.groups)]
    };
  }
  _readUserData(e) {
    super._readUserData(e), Sn(this.groups, e);
  }
}
class Lo extends Et {
  get _name() {
    return "collection";
  }
  get _optionsUtil() {
    return new We({
      forceIndex: {
        serverName: "force_index"
      }
    });
  }
  constructor(e, t) {
    super(t), // prepend slash to collection string
    this.Er = e.startsWith("/") ? e : "/" + e;
  }
  /**
   * @internal
   * @private
   */
  _toProto(e) {
    return {
      ...super._toProto(e),
      args: [{
        referenceValue: this.Er
      }]
    };
  }
  _readUserData(e) {
    super._readUserData(e);
  }
}
class ko extends Et {
  get _name() {
    return "collection_group";
  }
  get _optionsUtil() {
    return new We({
      forceIndex: {
        serverName: "force_index"
      }
    });
  }
  constructor(e, t) {
    super(t), this.collectionId = e;
  }
  /**
   * @internal
   * @private
   */
  _toProto(e) {
    return {
      ...super._toProto(e),
      args: [{
        referenceValue: ""
      }, {
        stringValue: this.collectionId
      }]
    };
  }
  _readUserData(e) {
    super._readUserData(e);
  }
}
class LB extends Et {
  get _name() {
    return "database";
  }
  get _optionsUtil() {
    return new We({});
  }
  /**
   * @internal
   * @private
   */
  _toProto(e) {
    return {
      ...super._toProto(e)
    };
  }
  _readUserData(e) {
    super._readUserData(e);
  }
}
class kB extends Et {
  get _name() {
    return "documents";
  }
  get _optionsUtil() {
    return new We({});
  }
  constructor(e, t) {
    if (super(t), !e || e.length === 0) throw new j(L.INVALID_ARGUMENT, "Empty document paths are not allowed in DocumentsSource");
    const n = e.map(((i) => i.startsWith("/") ? i : "/" + i)), s = new Set(n);
    if (s.size !== n.length) throw new j(L.INVALID_ARGUMENT, "Duplicate document paths are not allowed in DocumentsSource");
    this.hr = n, this.Tr = s;
  }
  /**
   * @internal
   * @private
   */
  _toProto(e) {
    return {
      ...super._toProto(e),
      args: this.hr.map(((t) => ({
        referenceValue: t
      })))
    };
  }
  _readUserData(e) {
    super._readUserData(e);
  }
}
class VB extends Et {
  get _name() {
    return "where";
  }
  get _optionsUtil() {
    return new We({});
  }
  constructor(e, t) {
    super(t), this.condition = e;
  }
  /**
   * @internal
   * @private
   */
  _toProto(e) {
    return {
      ...super._toProto(e),
      args: [this.condition._toProto(e)]
    };
  }
  _readUserData(e) {
    super._readUserData(e), Sn(this.condition, e);
  }
}
class Hs extends Et {
  get _name() {
    return "limit";
  }
  get _optionsUtil() {
    return new We({});
  }
  constructor(e, t) {
    Q(!isNaN(e) && e !== 1 / 0 && e !== -1 / 0, 34860), super(t), this.limit = e;
  }
  /**
   * @internal
   * @private
   */
  _toProto(e) {
    return {
      ...super._toProto(e),
      args: [IB(e, this.limit)]
    };
  }
}
class zl extends Et {
  get _name() {
    return "offset";
  }
  get _optionsUtil() {
    return new We({});
  }
  constructor(e, t) {
    super(t), this.offset = e;
  }
  /**
   * @internal
   * @private
   */
  _toProto(e) {
    return {
      ...super._toProto(e),
      args: [IB(e, this.offset)]
    };
  }
}
class BI extends Et {
  get _name() {
    return "select";
  }
  get _optionsUtil() {
    return new We({});
  }
  constructor(e, t) {
    super(t), this.selections = e;
  }
  /**
   * @internal
   * @private
   */
  _toProto(e) {
    return {
      ...super._toProto(e),
      args: [Ms(e, this.selections)]
    };
  }
  _readUserData(e) {
    super._readUserData(e), Sn(this.selections, e);
  }
}
class xB extends Et {
  get _name() {
    return "sort";
  }
  get _optionsUtil() {
    return new We({});
  }
  constructor(e, t) {
    super(t), this.orderings = e;
  }
  /**
   * @internal
   * @private
   */
  _toProto(e) {
    return {
      ...super._toProto(e),
      args: this.orderings.map(((t) => t._toProto(e)))
    };
  }
  _readUserData(e) {
    super._readUserData(e), Sn(this.orderings, e);
  }
}
class MB extends Et {
  get _name() {
    return "replace_with";
  }
  get _optionsUtil() {
    return new We({});
  }
  constructor(e, t) {
    super(t), this.map = e;
  }
  _toProto(e) {
    return {
      ...super._toProto(e),
      args: [this.map._toProto(e), cf(MB.Pr)]
    };
  }
  _readUserData(e) {
    super._readUserData(e), Sn(this.map, e);
  }
}
MB.Pr = "full_replace";
function Sn(r, e) {
  return $D(r) ? r._readUserData(e) : Array.isArray(r) ? r.forEach(((t) => t._readUserData(e))) : r instanceof Map ? r.forEach(((t) => t._readUserData(e))) : Object.values(r).forEach(((t) => t._readUserData(e))), r;
}
class st {
  constructor(e, t, n) {
    this.serializer = e, this.stages = t, this.listenOptions = n, this.isCorePipeline = !0;
  }
  getPipelineCollection() {
    return Vo(this);
  }
  getPipelineCollectionGroup() {
    return GB(this);
  }
  getPipelineCollectionId() {
    return uI(this);
  }
  getPipelineDocuments() {
    return Xa(this);
  }
  getPipelineFlavor() {
    return (function(t) {
      let n = "exact";
      return t.stages.forEach(((s, i) => {
        s._name !== Of.name && s._name !== Sf.name || (n = "keyless"), s._name === BI.name && n === "exact" && (n = "augmented"), // TODO(pipeline): verify the last stage is addFields, and it is added by the SDK.
        s._name === Pf.name && i < t.stages.length - 1 && n === "exact" && (n = "augmented");
      })), n;
    })(this);
  }
  getPipelineSourceType() {
    return Dn(this);
  }
}
function Dn(r) {
  const e = r.stages[0];
  return e instanceof Lo || e instanceof ko || e instanceof LB || e instanceof kB ? e._name : "unknown";
}
function Vo(r) {
  if (Dn(r) === "collection") return r.stages[0].Er;
}
function GB(r) {
  if (Dn(r) === "collection_group") return r.stages[0].collectionId;
}
function uI(r) {
  switch (Dn(r)) {
    case "collection":
      return he.fromString(Vo(r)).lastSegment();
    case "collection_group":
      return GB(r);
    default:
      return;
  }
}
function Xa(r) {
  if (Dn(r) === "documents") return r.stages[0].hr;
}
class I {
  constructor(e, t) {
    this.type = e, this.value = t;
  }
  static dr() {
    return new I("ERROR", void 0);
  }
  static mr() {
    return new I("UNSET", void 0);
  }
  static pr() {
    return new I("NULL", Sr);
  }
  static newValue(e) {
    return pt(e) ? new I("NULL", Sr) : (function(n) {
      return !!n && "booleanValue" in n;
    })(e) ? new I("BOOLEAN", e) : St(e) ? new I("INT", e) : zn(e) ? new I("DOUBLE", e) : (function(n) {
      return !!n && "timestampValue" in n && !!n.timestampValue;
    })(e) ? new I("TIMESTAMP", e) : (function(n) {
      return !!n && "stringValue" in n;
    })(e) ? new I("STRING", e) : (function(n) {
      return !!n && "bytesValue" in n;
    })(e) ? new I("BYTES", e) : e.referenceValue ? new I("REFERENCE", e) : e.geoPointValue ? new I("GEO_POINT", e) : br(e) ? new I("ARRAY", e) : so(e) ? new I("VECTOR", e) : Wn(e) ? new I("MAP", e) : new I("ERROR", void 0);
  }
  gr() {
    return this.type === "ERROR" || this.type === "UNSET";
  }
  yr() {
    return this.type === "NULL";
  }
}
function ys(r) {
  if (!r.gr()) return r.value;
}
function bf(r) {
  return r instanceof Pn ? r._expr : r;
}
function Z(r) {
  if ((r = bf(r)) instanceof Bi) return new cI(r);
  if (r instanceof Ur) return new lI(r);
  if (r instanceof fs) return new hI(r);
  if (r instanceof F) {
    if (r.name === "add") return new dI(r);
    if (r.name === "subtract") return new pI(r);
    if (r.name === "multiply") return new gI(r);
    if (r.name === "divide") return new mI(r);
    if (r.name === "mod") return new EI(r);
    if (r.name === "and") return new _I(r);
    if (r.name === "equal") return new bI(r);
    if (r.name === "not_equal") return new NI(r);
    if (r.name === "less_than") return new FI(r);
    if (r.name === "less_than_or_equal") return new LI(r);
    if (r.name === "greater_than") return new kI(r);
    if (r.name === "greater_than_or_equal") return new VI(r);
    if (r.name === "array_concat") return new xI(r);
    if (r.name === "array_reverse") return new MI(r);
    if (r.name === "array_contains") return new GI(r);
    if (r.name === "array_contains_all") return new HI(r);
    if (r.name === "array_contains_any") return new UI(r);
    if (r.name === "array_length") return new JI(r);
    if (r.name === "array_element") return new jI(r);
    if (r.name === "equal_any") return new Nf(r);
    if (r.name === "not_equal_any") return new II(r);
    if (r.name === "is_nan") return new wI(r);
    if (r.name === "is_not_nan") return new yI(r);
    if (r.name === "is_null") return new TI(r);
    if (r.name === "is_not_null") return new AI(r);
    if (r.name === "is_error") return new RI(r);
    if (r.name === "exists") return new vI(r);
    if (r.name === "not") return new xo(r);
    if (r.name === "or") return new DI(r);
    if (r.name === "xor") return new HB(r);
    if (r.name === "conditional") return new PI(r);
    if (r.name === "maximum") return new SI(r);
    if (r.name === "minimum") return new OI(r);
    if (r.name === "reverse") return new qI(r);
    if (r.name === "replace_first") return new KI(r);
    if (r.name === "replace_all") return new zI(r);
    if (r.name === "char_length") return new QI(r);
    if (r.name === "byte_length") return new WI(r);
    if (r.name === "like") return new $I(r);
    if (r.name === "regex_contains") return new YI(r);
    if (r.name === "regex_match") return new XI(r);
    if (r.name === "string_contains") return new ZI(r);
    if (r.name === "starts_with") return new ew(r);
    if (r.name === "ends_with") return new tw(r);
    if (r.name === "to_lower") return new nw(r);
    if (r.name === "to_upper") return new rw(r);
    if (r.name === "trim") return new sw(r);
    if (r.name === "string_concat") return new iw(r);
    if (r.name === "map_get") return new ow(r);
    if (r.name === "cosine_distance") return new aw(r);
    if (r.name === "dot_product") return new Bw(r);
    if (r.name === "euclidean_distance") return new uw(r);
    if (r.name === "vector_length") return new cw(r);
    if (r.name === "unix_micros_to_timestamp") return new dw(r);
    if (r.name === "timestamp_to_unix_micros") return new mw(r);
    if (r.name === "unix_millis_to_timestamp") return new pw(r);
    if (r.name === "timestamp_to_unix_millis") return new Ew(r);
    if (r.name === "unix_seconds_to_timestamp") return new gw(r);
    if (r.name === "timestamp_to_unix_seconds") return new _w(r);
    if (r.name === "timestamp_add") return new Dw(r);
    if (r.name === "timestamp_subtract") return new Iw(r);
  }
  throw new Error(`Unknown Expr : ${r}`);
}
class cI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    if (this.expr.fieldName === vr) return I.newValue({
      referenceValue: xs(e.serializer, t.key)
    });
    if (this.expr.fieldName === "__update_time__") return I.newValue({
      timestampValue: zi(e.serializer, t.version)
    });
    if (this.expr.fieldName === "__create_time__") return I.newValue({
      timestampValue: zi(e.serializer, t.createTime)
    });
    const n = t.data.field(this.expr._fieldPath);
    return n ? To(n) ? I.newValue((function(i, o) {
      if (i.serverTimestampBehavior === "estimate") return {
        timestampValue: zi(i.serializer, ee.fromTimestamp(Pr(o)))
      };
      if (i.serverTimestampBehavior === "previous") {
        const B = ti(o);
        if (B) return B;
      }
      return {
        nullValue: "NULL_VALUE"
      };
    })(e, n)) : I.newValue(n) : I.mr();
  }
}
class lI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    return I.newValue(this.expr._getValue());
  }
}
class hI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    const n = this.expr.ur.map(((s) => Z(s).evaluate(e, t)));
    return n.some(((s) => s.gr())) ? I.dr() : I.newValue({
      arrayValue: {
        values: n.map(((s) => s.value))
      }
    });
  }
}
function Je(r) {
  return zn(r) ? Number(r.doubleValue) : Number(r.integerValue);
}
function kt(r) {
  return BigInt(r.integerValue);
}
const CI = BigInt("0x7fffffffffffffff"), fI = -BigInt("0x8000000000000000");
class ui {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length >= 2, 24778);
    const n = Z(this.expr.params[0]).evaluate(e, t), s = Z(this.expr.params[1]).evaluate(e, t);
    let i = this.wr(n, s);
    for (const o of this.expr.params.slice(2)) {
      const B = Z(o).evaluate(e, t);
      i = this.wr(i, B);
    }
    return i;
  }
  wr(e, t) {
    if (e.gr() || t.gr()) return I.dr();
    if (e.yr() || t.yr()) return I.pr();
    const n = e.value, s = t.value;
    if (!zn(n) && !St(n) || !zn(s) && !St(s)) return I.dr();
    if (zn(n) || zn(s)) {
      const i = this.br(n, s);
      return i ? I.newValue(i) : I.dr();
    }
    if (St(n) && St(s)) {
      const i = this.Sr(n, s);
      return i === void 0 ? I.dr() : typeof i == "number" ? I.newValue({
        doubleValue: i
      }) : i < fI || i > CI ? I.dr() : I.newValue({
        integerValue: `${i}`
      });
    }
    return I.dr();
  }
}
function Wt(r, e) {
  return Le(r) !== Le(e) ? "TYPE_MISMATCH" : ut(r) || ut(e) ? "NOT_EQ" : pt(r) && pt(e) ? "EQ" : pt(r) || pt(e) ? "NULL" : br(r) && br(e) ? (function(n, s) {
    if (n.values?.length !== s.values?.length) return "NOT_EQ";
    let i = !1;
    for (let o = 0; o < (n.values?.length ?? 0); o++) {
      const B = n.values[o], u = s.values[o];
      switch (Wt(B, u)) {
        case "EQ":
          break;
        case "NOT_EQ":
        case "TYPE_MISMATCH":
          return "NOT_EQ";
        case "NULL":
          i = !0;
          break;
        default:
          $(44609, {
            vr: B,
            Dr: u
          });
      }
    }
    return i ? "NULL" : "EQ";
  })(r.arrayValue, e.arrayValue) : so(r) && so(e) || Wn(r) && Wn(e) ? (function(n, s) {
    const i = n.fields || {}, o = s.fields || {};
    if (no(i) !== no(o)) return "NOT_EQ";
    let B = !1;
    for (const u in i) if (i.hasOwnProperty(u)) {
      if (o[u] === void 0) return "NOT_EQ";
      switch (Wt(i[u], o[u])) {
        case "NOT_EQ":
        case "TYPE_MISMATCH":
          return "NOT_EQ";
        case "NULL":
          B = !0;
      }
    }
    return B ? "NULL" : "EQ";
  })(r.mapValue, e.mapValue) : (function(n, s) {
    return Dt(n, s, {
      o: !1,
      t: !0,
      i: !0
    });
  })(r, e) ? "EQ" : "NOT_EQ";
}
class dI extends ui {
  Sr(e, t) {
    return kt(e) + kt(t);
  }
  br(e, t) {
    return {
      doubleValue: Je(e) + Je(t)
    };
  }
}
class pI extends ui {
  constructor(e) {
    super(e), this.expr = e;
  }
  Sr(e, t) {
    return kt(e) - kt(t);
  }
  br(e, t) {
    return {
      doubleValue: Je(e) - Je(t)
    };
  }
}
class gI extends ui {
  constructor(e) {
    super(e), this.expr = e;
  }
  Sr(e, t) {
    return kt(e) * kt(t);
  }
  br(e, t) {
    return {
      doubleValue: Je(e) * Je(t)
    };
  }
}
class mI extends ui {
  constructor(e) {
    super(e), this.expr = e;
  }
  Sr(e, t) {
    const n = kt(t);
    if (n !== BigInt(0)) return kt(e) / n;
  }
  br(e, t) {
    const n = Je(t);
    return n === 0 ? {
      doubleValue: Os(n) ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY
    } : {
      doubleValue: Je(e) / n
    };
  }
}
class EI extends ui {
  constructor(e) {
    super(e), this.expr = e;
  }
  Sr(e, t) {
    const n = kt(t);
    if (n !== BigInt(0)) return kt(e) % n;
  }
  br(e, t) {
    const n = Je(t);
    if (n !== 0) return {
      doubleValue: Je(e) % n
    };
  }
}
class _I {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    let n = !1, s = !1;
    for (const i of this.expr.params) {
      const o = Z(i).evaluate(e, t);
      switch (o.type) {
        case "BOOLEAN":
          if (!o.value?.booleanValue) return I.newValue(He);
          break;
        case "NULL":
          s = !0;
          break;
        default:
          n = !0;
      }
    }
    return n ? I.dr() : s ? I.pr() : I.newValue(at);
  }
}
class xo {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 1, 9634);
    const n = Z(this.expr.params[0]).evaluate(e, t);
    switch (n.type) {
      case "BOOLEAN":
        return I.newValue({
          booleanValue: !n.value?.booleanValue
        });
      case "NULL":
        return I.pr();
      default:
        return I.dr();
    }
  }
}
class DI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    let n = !1, s = !1;
    for (const i of this.expr.params) {
      const o = Z(i).evaluate(e, t);
      switch (o.type) {
        case "BOOLEAN":
          if (o.value?.booleanValue) return I.newValue(at);
          break;
        case "NULL":
          s = !0;
          break;
        default:
          n = !0;
      }
    }
    return n ? I.dr() : s ? I.pr() : I.newValue(He);
  }
}
class HB {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    let n = !1, s = !1;
    for (const i of this.expr.params) {
      const o = Z(i).evaluate(e, t);
      switch (o.type) {
        case "BOOLEAN":
          n = HB.xor(n, !!o.value?.booleanValue);
          break;
        case "NULL":
          s = !0;
          break;
        default:
          return I.dr();
      }
    }
    return s ? I.pr() : I.newValue({
      booleanValue: n
    });
  }
  // XOR(a, b) is equivalent to (a OR b) AND NOT(a AND b)
  // It is required to evaluate all arguments to ensure that the correct error semantics are
  // applied.
  static xor(e, t) {
    return (e || t) && !(e && t);
  }
}
class Nf {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 2, 55094);
    let n = !1;
    const s = Z(this.expr.params[0]).evaluate(e, t);
    switch (s.type) {
      case "NULL":
        n = !0;
        break;
      case "ERROR":
      case "UNSET":
        return I.dr();
    }
    const i = Z(this.expr.params[1]).evaluate(e, t);
    switch (i.type) {
      case "ARRAY":
        break;
      case "NULL":
        n = !0;
        break;
      default:
        return I.dr();
    }
    if (n) return I.pr();
    for (const o of i.value?.arrayValue?.values ?? [])
      switch (pt(s.value) && pt(o) ? "EQ" : Wt(s.value, o)) {
        case "EQ":
          return I.newValue(at);
        case "NOT_EQ":
        case "TYPE_MISMATCH":
          break;
        case "NULL":
          n = !0;
          break;
        default:
          $(44608, {
            value: s.value,
            candidate: o
          });
      }
    return n ? I.pr() : I.newValue(He);
  }
}
class II {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    return new xo(new F("not", [new F("equal_any", this.expr.params)])).evaluate(e, t);
  }
}
class wI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 1, 23322);
    const n = Z(this.expr.params[0]).evaluate(e, t);
    switch (n.type) {
      case "INT":
        return I.newValue(He);
      case "DOUBLE":
        return I.newValue({
          booleanValue: isNaN(Je(n.value))
        });
      case "NULL":
        return I.pr();
      default:
        return I.dr();
    }
  }
}
class yI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    return Q(this.expr.params.length === 1, 50406), new xo(new F("not", [new F("is_nan", this.expr.params)])).evaluate(e, t);
  }
}
class TI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    switch (Q(this.expr.params.length === 1, 23123), Z(this.expr.params[0]).evaluate(e, t).type) {
      case "NULL":
        return I.newValue(at);
      case "UNSET":
      case "ERROR":
        return I.dr();
      default:
        return I.newValue(He);
    }
  }
}
class AI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    return Q(this.expr.params.length === 1, 23167), new xo(new F("not", [new F("is_null", this.expr.params)])).evaluate(e, t);
  }
}
class RI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    return Q(this.expr.params.length === 1, 5228), Z(this.expr.params[0]).evaluate(e, t).type === "ERROR" ? I.newValue(at) : I.newValue(He);
  }
}
class vI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    switch (Q(this.expr.params.length === 1, 6877), Z(this.expr.params[0]).evaluate(e, t).type) {
      case "ERROR":
        return I.dr();
      case "UNSET":
        return I.newValue(He);
      default:
        return I.newValue(at);
    }
  }
}
class PI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 3, 11706);
    const n = Z(this.expr.params[0]).evaluate(e, t);
    switch (n.type) {
      case "BOOLEAN":
        return n.value?.booleanValue ? Z(this.expr.params[1]).evaluate(e, t) : Z(this.expr.params[2]).evaluate(e, t);
      case "NULL":
        return Z(this.expr.params[2]).evaluate(e, t);
      default:
        return I.dr();
    }
  }
}
class SI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    const n = this.expr.params.map(((i) => Z(i).evaluate(e, t)));
    let s;
    for (const i of n) switch (i.type) {
      case "ERROR":
      case "UNSET":
      case "NULL":
        continue;
      default:
        s = s === void 0 || Bt(i.value, s.value) > 0 ? i : s;
    }
    return s === void 0 ? I.pr() : s;
  }
}
class OI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    const n = this.expr.params.map(((i) => Z(i).evaluate(e, t)));
    let s;
    for (const i of n) switch (i.type) {
      case "ERROR":
      case "UNSET":
      case "NULL":
        continue;
      default:
        s = s === void 0 || Bt(i.value, s.value) < 0 ? i : s;
    }
    return s === void 0 ? I.pr() : s;
  }
}
class Jr {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 2, 31033, `${this.expr.name}() function should have exactly 2 params`);
    const n = Z(this.expr.params[0]).evaluate(e, t);
    switch (n.type) {
      case "ERROR":
      case "UNSET":
        return I.dr();
    }
    const s = Z(this.expr.params[1]).evaluate(e, t);
    switch (s.type) {
      case "ERROR":
      case "UNSET":
        return I.dr();
    }
    return this.Cr(n, s);
  }
}
class bI extends Jr {
  constructor(e) {
    super(e), this.expr = e;
  }
  Cr(e, t) {
    if (e.yr() && t.yr()) return I.newValue(at);
    if (e.yr() || t.yr() || ut(e.value) || ut(t.value) || Le(e.value) !== Le(t.value)) return I.newValue(He);
    switch (Wt(e.value, t.value)) {
      case "EQ":
        return I.newValue(at);
      case "NOT_EQ":
        return I.newValue(He);
      case "NULL":
        return I.pr();
      default:
        $(44615, {
          left: e,
          right: t
        });
    }
  }
}
class NI extends Jr {
  constructor(e) {
    super(e), this.expr = e;
  }
  Cr(e, t) {
    switch (Wt(e.value, t.value)) {
      case "EQ":
        return I.newValue(He);
      case "NOT_EQ":
      case "TYPE_MISMATCH":
        return I.newValue(at);
      case "NULL":
        return I.pr();
      default:
        $(44614, {
          left: e,
          right: t
        });
    }
  }
}
class FI extends Jr {
  constructor(e) {
    super(e), this.expr = e;
  }
  Cr(e, t) {
    return Le(e.value) !== Le(t.value) || ut(e.value) || ut(t.value) ? I.newValue(He) : I.newValue({
      booleanValue: Bt(e.value, t.value) < 0
    });
  }
}
class LI extends Jr {
  constructor(e) {
    super(e), this.expr = e;
  }
  Cr(e, t) {
    return Le(e.value) !== Le(t.value) || ut(e.value) || ut(t.value) ? I.newValue(He) : Wt(e.value, t.value) === "EQ" ? I.newValue(at) : I.newValue({
      booleanValue: Bt(e.value, t.value) < 0
    });
  }
}
class kI extends Jr {
  constructor(e) {
    super(e), this.expr = e;
  }
  Cr(e, t) {
    return Le(e.value) !== Le(t.value) || ut(e.value) || ut(t.value) ? I.newValue(He) : I.newValue({
      booleanValue: Bt(e.value, t.value) > 0
    });
  }
}
class VI extends Jr {
  constructor(e) {
    super(e), this.expr = e;
  }
  Cr(e, t) {
    return Le(e.value) !== Le(t.value) || ut(e.value) || ut(t.value) ? I.newValue(He) : Wt(e.value, t.value) === "EQ" ? I.newValue(at) : I.newValue({
      booleanValue: Bt(e.value, t.value) > 0
    });
  }
}
class xI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    throw new Error("Unimplemented");
  }
}
class MI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 1, 216);
    const n = Z(this.expr.params[0]).evaluate(e, t);
    switch (n.type) {
      case "NULL":
        return I.pr();
      case "ARRAY": {
        const s = n.value.arrayValue?.values ?? [];
        return I.newValue({
          arrayValue: {
            values: [...s].reverse()
          }
        });
      }
      default:
        return I.dr();
    }
  }
}
class GI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    return Q(this.expr.params.length === 2, 52884), new Nf(new F("eq_any", [this.expr.params[1], this.expr.params[0]])).evaluate(e, t);
  }
}
class HI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 2, 1392);
    let n = !1;
    const s = Z(this.expr.params[0]).evaluate(e, t);
    switch (s.type) {
      case "ARRAY":
        break;
      case "NULL":
        n = !0;
        break;
      default:
        return I.dr();
    }
    const i = Z(this.expr.params[1]).evaluate(e, t);
    switch (i.type) {
      case "ARRAY":
        break;
      case "NULL":
        n = !0;
        break;
      default:
        return I.dr();
    }
    if (n) return I.pr();
    const o = i.value?.arrayValue?.values ?? [], B = s.value?.arrayValue?.values ?? [];
    for (const u of o) {
      let c = !1;
      n = !1;
      for (const C of B) {
        switch (pt(u) && pt(C) ? "EQ" : Wt(u, C)) {
          case "EQ":
            c = !0;
            break;
          case "NOT_EQ":
          case "TYPE_MISMATCH":
            break;
          case "NULL":
            n = !0;
            break;
          default:
            $(44613, {
              value: C,
              search: u
            });
        }
        if (c)
          break;
      }
      if (!c)
        return I.newValue(He);
    }
    return I.newValue(at);
  }
}
class UI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 2, 2680);
    let n = !1;
    const s = Z(this.expr.params[0]).evaluate(e, t);
    switch (s.type) {
      case "ARRAY":
        break;
      case "NULL":
        n = !0;
        break;
      default:
        return I.dr();
    }
    const i = Z(this.expr.params[1]).evaluate(e, t);
    switch (i.type) {
      case "ARRAY":
        break;
      case "NULL":
        n = !0;
        break;
      default:
        return I.dr();
    }
    if (n) return I.pr();
    const o = i.value?.arrayValue?.values ?? [], B = s.value?.arrayValue?.values ?? [];
    for (const u of B) for (const c of o)
      switch (pt(u) && pt(c) ? "EQ" : Wt(u, c)) {
        case "EQ":
          return I.newValue(at);
        case "NOT_EQ":
        case "TYPE_MISMATCH":
          break;
        case "NULL":
          n = !0;
          break;
        default:
          $(60403, {
            value: u,
            search: c
          });
      }
    return n ? I.pr() : I.newValue(He);
  }
}
class JI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 1, 38605);
    const n = Z(this.expr.params[0]).evaluate(e, t);
    switch (n.type) {
      case "NULL":
        return I.pr();
      case "ARRAY":
        return I.newValue({
          integerValue: `${n.value?.arrayValue?.values?.length ?? 0}`
        });
      default:
        return I.dr();
    }
  }
}
class jI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    throw new Error("Unimplemented");
  }
}
class qI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 1, 1508);
    const n = Z(this.expr.params[0]).evaluate(e, t);
    switch (n.type) {
      case "NULL":
        return I.pr();
      case "BYTES": {
        const s = n.value?.bytesValue;
        if (typeof s == "string") {
          const i = Fe.fromBase64String(s).toUint8Array();
          return i.reverse(), I.newValue({
            bytesValue: Fe.fromUint8Array(i).toBase64()
          });
        }
        return I.newValue({
          bytesValue: new Uint8Array(s).reverse()
        });
      }
      case "STRING": {
        const s = n.value?.stringValue, i = new Intl.__PRIVATE_Segmenter(void 0, {
          granularity: "grapheme"
        }).segment(s), o = Array.from(i, ((B) => B.segment)).reverse();
        return I.newValue({
          stringValue: o.join("")
        });
      }
      default:
        return I.dr();
    }
  }
}
class KI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    throw new Error("Unimplemented");
  }
}
class zI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    throw new Error("Unimplemented");
  }
}
class QI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 1, 19400);
    const n = Z(this.expr.params[0]).evaluate(e, t);
    switch (n.type) {
      case "NULL":
        return I.pr();
      case "STRING": {
        const s = (function(o) {
          let B = 0;
          for (let u = 0; u < o.length; u++) {
            const c = o.codePointAt(u);
            if (c === void 0) return;
            if (c <= 65535)
              if (c >= 55296 && c <= 57343)
                if (c <= 56319) {
                  const C = o.codePointAt(u + 1);
                  C !== void 0 && C >= 56320 && C <= 57343 ? (
                    // Valid surrogate pair (counts as one character)
                    (B += 1, u++)
                  ) : (
                    // Lone high surrogate - treat as one character for length, but invalid for byte length
                    B += 1
                  );
                } else
                  B += 1;
              else
                B += 1;
            else {
              if (!(c <= 1114111)) return;
              B += 1, u++;
            }
          }
          return B;
        })(n.value.stringValue);
        return s === void 0 ? I.dr() : I.newValue({
          integerValue: s
        });
      }
      default:
        return I.dr();
    }
  }
}
class WI {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 1, 8486);
    const n = Z(this.expr.params[0]).evaluate(e, t);
    switch (n.type) {
      case "BYTES": {
        const s = n.value?.bytesValue;
        return typeof s == "string" ? I.newValue({
          integerValue: Fe.fromBase64String(s).toUint8Array().length
        }) : I.newValue({
          integerValue: new Uint8Array(s).length
        });
      }
      case "STRING": {
        const s = (function(o) {
          let B = 0;
          for (let u = 0; u < o.length; u++) {
            const c = o.codePointAt(u);
            if (c === void 0) return;
            if (c >= 55296 && c <= 57343) {
              if (!(c <= 56319)) return;
              {
                const C = o.codePointAt(u + 1);
                if (C === void 0 || !(C >= 56320 && C <= 57343)) return;
                B += 4, u++;
              }
            } else if (c <= 127) B += 1;
            else if (c <= 2047) B += 2;
            else if (c <= 65535) B += 3;
            else {
              if (!(c <= 1114111)) return;
              B += 4, u++;
            }
          }
          return B;
        })(n.value?.stringValue);
        return s === void 0 ? I.dr() : I.newValue({
          integerValue: s
        });
      }
      case "NULL":
        return I.pr();
      default:
        return I.dr();
    }
  }
}
class jr {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 2, 39773, `${this.expr.name}() function should have exactly two parameters`);
    let n = !1;
    const s = Z(this.expr.params[0]).evaluate(e, t);
    switch (s.type) {
      case "STRING":
        break;
      case "NULL":
        n = !0;
        break;
      default:
        return I.dr();
    }
    const i = Z(this.expr.params[1]).evaluate(e, t);
    switch (i.type) {
      case "STRING":
        break;
      case "NULL":
        n = !0;
        break;
      default:
        return I.dr();
    }
    return n ? I.pr() : this.Fr(s.value?.stringValue, i.value?.stringValue);
  }
}
class $I extends jr {
  Fr(e, t) {
    try {
      const n = (function(o) {
        let B = "";
        for (let u = 0; u < o.length; u++) {
          const c = o.charAt(u);
          switch (c) {
            case "_":
              B += ".";
              break;
            case "%":
              B += ".*";
              break;
            // Escape regex special characters
            case "\\":
            // Need to escape backslash itself
            case ".":
            case "*":
            case "?":
            case "+":
            case "^":
            case "$":
            case "|":
            case "(":
            case ")":
            case "[":
            case "]":
            case "{":
            case "}":
              B += "\\" + c;
              break;
            default:
              B += c;
          }
        }
        return "^" + B + "$";
      })(t), s = gB.compile(n);
      return I.newValue({
        booleanValue: s.matches(e)
      });
    } catch (n) {
      return Tt(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${n}`), I.dr();
    }
  }
}
class YI extends jr {
  Fr(e, t) {
    try {
      const n = gB.compile(t);
      return I.newValue({
        booleanValue: n.test(e)
      });
    } catch {
      return Tt(`Invalid regex pattern found in regex_contains: ${t}, returning error`), I.dr();
    }
  }
}
class XI extends jr {
  Fr(e, t) {
    try {
      return I.newValue({
        booleanValue: gB.compile(t).matches(e)
      });
    } catch {
      return Tt(`Invalid regex pattern found in regex_match: ${t}, returning error`), I.dr();
    }
  }
}
class ZI extends jr {
  Fr(e, t) {
    return I.newValue({
      booleanValue: e.includes(t)
    });
  }
}
class ew extends jr {
  Fr(e, t) {
    return I.newValue({
      booleanValue: e.startsWith(t)
    });
  }
}
class tw extends jr {
  Fr(e, t) {
    return I.newValue({
      booleanValue: e.endsWith(t)
    });
  }
}
class nw {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 1, 29079);
    const n = Z(this.expr.params[0]).evaluate(e, t);
    switch (n.type) {
      case "STRING":
        return I.newValue({
          stringValue: n.value?.stringValue?.toLowerCase()
        });
      case "NULL":
        return I.pr();
      default:
        return I.dr();
    }
  }
}
class rw {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 1, 60487);
    const n = Z(this.expr.params[0]).evaluate(e, t);
    switch (n.type) {
      case "STRING":
        return I.newValue({
          stringValue: n.value?.stringValue?.toUpperCase()
        });
      case "NULL":
        return I.pr();
      default:
        return I.dr();
    }
  }
}
class sw {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 1, 28544);
    const n = Z(this.expr.params[0]).evaluate(e, t);
    switch (n.type) {
      case "STRING":
        return I.newValue({
          stringValue: n.value?.stringValue?.trim()
        });
      case "NULL":
        return I.pr();
      default:
        return I.dr();
    }
  }
}
class iw {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    const n = this.expr.params.map(((o) => Z(o).evaluate(e, t)));
    let s = "", i = !1;
    for (const o of n) switch (o.type) {
      case "STRING":
        s += o.value.stringValue;
        break;
      case "NULL":
        i = !0;
        break;
      default:
        return I.dr();
    }
    return i ? I.pr() : I.newValue({
      stringValue: s
    });
  }
}
class ow {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 2, 4483);
    const n = Z(this.expr.params[0]).evaluate(e, t);
    switch (n.type) {
      case "UNSET":
        return I.mr();
      case "MAP":
        break;
      default:
        return I.dr();
    }
    const s = Z(this.expr.params[1]).evaluate(e, t);
    if (s.type !== "STRING") return I.dr();
    const i = n.value?.mapValue?.fields?.[s.value?.stringValue];
    return i === void 0 ? I.mr() : I.newValue(i);
  }
}
class UB {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 2, 25231, `${this.expr.name}() function should have exactly 2 params`);
    let n = !1;
    const s = Z(this.expr.params[0]).evaluate(e, t);
    switch (s.type) {
      case "VECTOR":
        break;
      case "NULL":
        n = !0;
        break;
      default:
        return I.dr();
    }
    const i = Z(this.expr.params[1]).evaluate(e, t);
    switch (i.type) {
      case "VECTOR":
        break;
      case "NULL":
        n = !0;
        break;
      default:
        return I.dr();
    }
    if (n) return I.pr();
    const o = ja(s.value), B = ja(i.value);
    if (o === void 0 || B === void 0 || o.values?.length !== B.values?.length) return I.dr();
    const u = this.Or(o, B);
    return u === void 0 || isNaN(u) ? I.dr() : I.newValue({
      doubleValue: u
    });
  }
}
class aw extends UB {
  Or(e, t) {
    const n = e?.values ?? [], s = t?.values ?? [];
    if (n.length === 0) return;
    let i = 0, o = 0, B = 0;
    for (let c = 0; c < n.length; c++) {
      if (!An(n[c]) || !An(s[c])) return;
      const C = Je(n[c]), f = Je(s[c]);
      i += C * f, o += C * C, B += f * f;
    }
    const u = Math.sqrt(o) * Math.sqrt(B);
    if (u !== 0)
      return 1 - Math.max(-1, Math.min(1, i / u));
  }
}
class Bw extends UB {
  Or(e, t) {
    const n = e?.values ?? [], s = t?.values ?? [];
    if (n.length === 0) return 0;
    let i = 0;
    for (let o = 0; o < n.length; o++) {
      if (!An(n[o]) || !An(s[o])) return;
      i += Je(n[o]) * Je(s[o]);
    }
    return i;
  }
}
class uw extends UB {
  Or(e, t) {
    const n = e?.values ?? [], s = t?.values ?? [];
    if (n.length === 0) return 0;
    let i = 0;
    for (let o = 0; o < n.length; o++) {
      if (!An(n[o]) || !An(s[o])) return;
      const B = Je(n[o]), u = Je(s[o]);
      i += Math.pow(B - u, 2);
    }
    return Math.sqrt(i);
  }
}
class cw {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 1, 39044);
    const n = Z(this.expr.params[0]).evaluate(e, t);
    switch (n.type) {
      case "VECTOR": {
        const s = ja(n.value);
        return I.newValue({
          integerValue: s?.values?.length ?? 0
        });
      }
      case "NULL":
        return I.pr();
      default:
        return I.dr();
    }
  }
}
const Us = BigInt(-62135596800), Js = BigInt(253402300799), Co = BigInt(1e3), In = BigInt(1e6), lw = Us * Co, hw = Js * Co + BigInt(999), Cw = Us * In, fw = Js * In + BigInt(999999);
function JB(r) {
  return r >= Cw && r <= fw;
}
function Ff(r) {
  return r >= Us && r <= Js;
}
function js(r, e) {
  const t = BigInt(r);
  return !(t < Us || t > Js) && // Nanos must be non-negative and less than 1 second
  !(e < 0 || e >= 1e9) && // Additional check for min/max boundaries
  (t !== Us || e === 0) && !(t === Js && e > 999999999);
}
function Lf(r, e) {
  return e < 0 ? {
    seconds: r - 1,
    nanos: e + 1e9
  } : {
    seconds: r,
    nanos: e
  };
}
function jB(r) {
  return BigInt(r.seconds) * In + // Integer division truncates towards zero
  BigInt(Math.trunc(r.nanoseconds / 1e3));
}
class qB {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 1, 49262, `${this.expr.name}() function should have exactly one parameter`);
    const n = Z(this.expr.params[0]).evaluate(e, t);
    switch (n.type) {
      case "INT":
        return this.toTimestamp(BigInt(n.value.integerValue));
      case "NULL":
        return I.pr();
      default:
        return I.dr();
    }
  }
}
class dw extends qB {
  toTimestamp(e) {
    if (!JB(e)) return I.dr();
    let t = Number(e / In), n = Number(e % In * BigInt(1e3));
    const s = Lf(t, n);
    return t = s.seconds, n = s.nanos, js(t, n) ? I.newValue({
      timestampValue: {
        seconds: t,
        nanos: n
      }
    }) : I.dr();
  }
}
class pw extends qB {
  toTimestamp(e) {
    if (!(function(o) {
      return o >= lw && o <= hw;
    })(e)) return I.dr();
    let t = Number(e / Co), n = Number(e % Co * BigInt(1e6));
    const s = Lf(t, n);
    return t = s.seconds, n = s.nanos, js(t, n) ? I.newValue({
      timestampValue: {
        seconds: t,
        nanos: n
      }
    }) : I.dr();
  }
}
class gw extends qB {
  toTimestamp(e) {
    if (!Ff(e)) return I.dr();
    const t = Number(e);
    return I.newValue({
      timestampValue: {
        seconds: t,
        nanos: 0
      }
    });
  }
}
class KB {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 1, 1265, `${this.expr.name}() function should have exactly one parameter`);
    const n = Z(this.expr.params[0]).evaluate(e, t);
    switch (n.type) {
      case "TIMESTAMP":
        break;
      case "NULL":
        return I.pr();
      default:
        return I.dr();
    }
    const s = vB(n.value.timestampValue);
    return js(s.seconds, s.nanoseconds) ? this.Mr(s) : I.dr();
  }
}
class mw extends KB {
  Mr(e) {
    const t = jB(e);
    return JB(t) ? I.newValue({
      integerValue: `${t.toString()}`
    }) : I.dr();
  }
}
class Ew extends KB {
  Mr(e) {
    const t = jB(e), n = t / BigInt(1e3), s = t % BigInt(1e3);
    return n > BigInt(0) || s === BigInt(0) ? I.newValue({
      integerValue: n.toString()
    }) : I.newValue({
      integerValue: (n - BigInt(1)).toString()
    });
  }
}
class _w extends KB {
  Mr(e) {
    const t = BigInt(e.seconds);
    return Ff(t) ? I.newValue({
      integerValue: t.toString()
    }) : I.dr();
  }
}
class kf {
  constructor(e) {
    this.expr = e;
  }
  evaluate(e, t) {
    Q(this.expr.params.length === 3, 2775, `${this.expr.name}() function should have exactly 3 parameters`);
    let n = !1;
    const s = Z(this.expr.params[0]).evaluate(e, t);
    switch (s.type) {
      case "TIMESTAMP":
        break;
      case "NULL":
        n = !0;
        break;
      default:
        return I.dr();
    }
    const i = Z(this.expr.params[1]).evaluate(e, t);
    let o;
    switch (i.type) {
      case "STRING":
        if (o = (function(se) {
          switch (se) {
            case "microsecond":
              return "microsecond";
            case "millisecond":
              return "millisecond";
            case "second":
              return "second";
            case "minute":
              return "minute";
            case "hour":
              return "hour";
            case "day":
              return "day";
            default:
              return;
          }
        })(i.value.stringValue), o === void 0) return I.dr();
        break;
      case "NULL":
        n = !0;
        break;
      default:
        return I.dr();
    }
    const B = Z(this.expr.params[2]).evaluate(e, t);
    switch (B.type) {
      case "INT":
        break;
      case "NULL":
        n = !0;
        break;
      default:
        return I.dr();
    }
    if (n) return I.pr();
    const u = BigInt(B.value.integerValue);
    let c;
    try {
      switch (o) {
        case "microsecond":
          c = u;
          break;
        case "millisecond":
          c = u * BigInt(1e3);
          break;
        case "second":
          c = u * BigInt(1e6);
          break;
        case "minute":
          c = u * BigInt(6e7);
          break;
        case "hour":
          c = u * BigInt(36e8);
          break;
        case "day":
          c = u * BigInt(864e8);
          break;
        default:
          return I.dr();
      }
      if (o !== "microsecond" && u !== BigInt(0) && c / u !== BigInt(this.Nr(o))) return I.dr();
    } catch (z) {
      return Tt(`Error during timestamp arithmetic: ${z}`), I.dr();
    }
    const C = vB(s.value.timestampValue);
    if (!js(C.seconds, C.nanoseconds)) return I.dr();
    const f = jB(C), m = this.Lr(f, c);
    if (!JB(m)) return I.dr();
    const R = Number(m / In), P = m % In, x = Number((P < 0 ? P + In : P) * BigInt(1e3)), H = P < 0 ? R - 1 : R;
    return js(H, x) ? I.newValue({
      timestampValue: {
        seconds: H,
        nanos: x
      }
    }) : I.dr();
  }
  Nr(e) {
    switch (e) {
      case "millisecond":
        return 1e3;
      case "second":
        return 1e6;
      case "minute":
        return 6e7;
      case "hour":
        return 36e8;
      case "day":
        return 864e8;
      default:
        return 1;
    }
  }
}
class Dw extends kf {
  Lr(e, t) {
    return e + t;
  }
}
class Iw extends kf {
  Lr(e, t) {
    return e - t;
  }
}
function qs(r) {
  if ((r = bf(r)) instanceof Bi) return `fld(${r.fieldName})`;
  if (r instanceof Ur) return `cst(${(function(t) {
    return t === null ? "null" : typeof t == "number" ? t.toString() : typeof t == "string" ? `"${t}"` : t instanceof Te ? `ref(${t.path})` : t instanceof ot ? `vec(${JSON.stringify(t)})` : JSON.stringify(t);
  })(r.value)})`;
  if (r instanceof F) return `fn(${r.name},[${r.params.map(qs).join(",")}])`;
  if (r.expressionType === "ListOfExpressions") return `list([${r.ur.map(qs).join(",")}])`;
  throw new Error(`Unrecognized expr ${JSON.stringify(r, null, 2)}`);
}
function ww(r) {
  if (r instanceof Pf) return `${r._name}(${xi(r.fields)})`;
  if (r instanceof Sf) {
    let e = `${r._name}(${xi(r.accumulators)})`;
    return r.groups.size > 0 && (e += `grouping(${xi(r.groups)})`), e;
  }
  if (r instanceof Of) return `${r._name}(${xi(r.groups)})`;
  if (r instanceof Lo) return `${r._name}(${r.Er})`;
  if (r instanceof ko) return `${r._name}(${r.collectionId})`;
  if (r instanceof LB) return `${r._name}()`;
  if (r instanceof kB) return `${r._name}(${r.hr.sort()})`;
  if (r instanceof VB) return `${r._name}(${qs(r.condition)})`;
  if (r instanceof Hs) return `${r._name}(${r.limit})`;
  if (r instanceof xB) return `${r._name}(${(function(t) {
    return t.map(((n) => `${qs(n.expr)}${n.direction}`)).join(",");
  })(r.orderings)})`;
  throw new Error(`Unrecognized stage ${r._name}`);
}
function xi(r) {
  return `${Array.from(r.entries()).sort().map((([e, t]) => `${e}=${qs(t)}`)).join(",")}`;
}
function qt(r) {
  return r.stages.map(((e) => ww(e))).join("|");
}
function Vf(r, e) {
  return qt(r) === qt(e);
}
function Ve(r) {
  return r instanceof st;
}
function Ql(r) {
  return Ve(r) ? qt(r) : Ds(r);
}
function xf(r) {
  return Ve(r) ? qt(r) : (function(t) {
    return `${JC(Ft(t))}|lt:${t.limitType}`;
  })(r);
}
function Mo(r, e) {
  return r instanceof st && e instanceof st ? Vf(r, e) : !(r instanceof st && !(e instanceof st) || !(r instanceof st) && e instanceof st) && J_(r, e);
}
function Mf(r) {
  return qn(r) ? qt(r) : JC(r);
}
function Gf(r, e) {
  return r instanceof st && e instanceof st ? Vf(r, e) : !(r instanceof st && !(e instanceof st) || !(r instanceof st) && e instanceof st) && jC(r, e);
}
class yw {
  /**
   * @param batchId - The unique ID of this mutation batch.
   * @param localWriteTime - The original write time of this mutation.
   * @param baseMutations - Mutations that are used to populate the base
   * values when this mutation is applied locally. This can be used to locally
   * overwrite values that are persisted in the remote document cache. Base
   * mutations are never sent to the backend.
   * @param mutations - The user-provided mutations in this mutation batch.
   * User-provided mutations are applied both locally and remotely on the
   * backend.
   */
  constructor(e, t, n, s) {
    this.batchId = e, this.localWriteTime = t, this.baseMutations = n, this.mutations = s;
  }
  /**
   * Applies all the mutations in this MutationBatch to the specified document
   * to compute the state of the remote document
   *
   * @param document - The document to apply mutations to.
   * @param batchResult - The result of applying the MutationBatch to the
   * backend.
   */
  applyToRemoteDocument(e, t) {
    const n = t.mutationResults;
    for (let s = 0; s < this.mutations.length; s++) {
      const i = this.mutations[s];
      i.key.isEqual(e.key) && T_(i, e, n[s]);
    }
  }
  /**
   * Computes the local view of a document given all the mutations in this
   * batch.
   *
   * @param document - The document to apply mutations to.
   * @param mutatedFields - Fields that have been updated before applying this mutation batch.
   * @returns A `FieldMask` representing all the fields that are mutated.
   */
  applyToLocalView(e, t) {
    for (const n of this.baseMutations) n.key.isEqual(e.key) && (t = Es(n, e, t, this.localWriteTime));
    for (const n of this.mutations) n.key.isEqual(e.key) && (t = Es(n, e, t, this.localWriteTime));
    return t;
  }
  /**
   * Computes the local view for all provided documents given the mutations in
   * this batch. Returns a `DocumentKey` to `Mutation` map which can be used to
   * replace all the mutation applications.
   */
  applyToLocalDocumentSet(e, t) {
    const n = YC();
    return this.mutations.forEach(((s) => {
      const i = e.get(s.key), o = i.overlayedDocument;
      let B = this.applyToLocalView(o, i.mutatedFields);
      B = t.has(s.key) ? null : B;
      const u = FC(o, B);
      u !== null && n.set(s.key, u), o.isValidDocument() || o.convertToNoDocument(ee.min());
    })), n;
  }
  keys() {
    return this.mutations.reduce(((e, t) => e.add(t.key)), ie());
  }
  isEqual(e) {
    return this.batchId === e.batchId && Rr(this.mutations, e.mutations, ((t, n) => Tl(t, n))) && Rr(this.baseMutations, e.baseMutations, ((t, n) => Tl(t, n)));
  }
}
class zB {
  constructor(e, t, n, s) {
    this.batch = e, this.commitVersion = t, this.mutationResults = n, this.docVersions = s;
  }
  /**
   * Creates a new MutationBatchResult for the given batch and results. There
   * must be one result for each mutation in the batch. This static factory
   * caches a document=&gt;version mapping (docVersions).
   */
  static from(e, t, n) {
    Q(e.mutations.length === n.length, 58842, {
      Br: e.mutations.length,
      Ur: n.length
    });
    let s = /* @__PURE__ */ (function() {
      return z_;
    })();
    const i = e.mutations;
    for (let o = 0; o < i.length; o++) s = s.insert(i[o].key, n[o].version);
    return new zB(e, t, n, s);
  }
}
const Hf = "";
function Tw(r) {
  let e = "";
  for (let t = 0; t < r.length; t++) e.length > 0 && (e = Wl(e)), e = Aw(r.get(t), e);
  return Wl(e);
}
function Aw(r, e) {
  let t = e;
  const n = r.length;
  for (let s = 0; s < n; s++) {
    const i = r.charAt(s);
    switch (i) {
      case "\0":
        t += "";
        break;
      case Hf:
        t += "";
        break;
      default:
        t += i;
    }
  }
  return t;
}
function Wl(r) {
  return r + Hf + "";
}
class Rw {
  constructor(e, t) {
    this.largestBatchId = e, this.mutation = t;
  }
  getKey() {
    return this.mutation.key;
  }
  isEqual(e) {
    return e !== null && this.mutation === e.mutation;
  }
  toString() {
    return `Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`;
  }
}
class Jt {
  constructor(e, t, n, s, i = ee.min(), o = ee.min(), B = Fe.EMPTY_BYTE_STRING, u = null) {
    this.target = e, this.targetId = t, this.purpose = n, this.sequenceNumber = s, this.snapshotVersion = i, this.lastLimboFreeSnapshotVersion = o, this.resumeToken = B, this.expectedCount = u;
  }
  /** Creates a new target data instance with an updated sequence number. */
  withSequenceNumber(e) {
    return new Jt(this.target, this.targetId, this.purpose, e, this.snapshotVersion, this.lastLimboFreeSnapshotVersion, this.resumeToken, this.expectedCount);
  }
  /**
   * Creates a new target data instance with an updated resume token and
   * snapshot version.
   */
  withResumeToken(e, t) {
    return new Jt(
      this.target,
      this.targetId,
      this.purpose,
      this.sequenceNumber,
      t,
      this.lastLimboFreeSnapshotVersion,
      e,
      /* expectedCount= */
      null
    );
  }
  /**
   * Creates a new target data instance with an updated expected count.
   */
  withExpectedCount(e) {
    return new Jt(this.target, this.targetId, this.purpose, this.sequenceNumber, this.snapshotVersion, this.lastLimboFreeSnapshotVersion, this.resumeToken, e);
  }
  /**
   * Creates a new target data instance with an updated last limbo free
   * snapshot version number.
   */
  withLastLimboFreeSnapshotVersion(e) {
    return new Jt(this.target, this.targetId, this.purpose, this.sequenceNumber, this.snapshotVersion, e, this.resumeToken, this.expectedCount);
  }
}
class vw {
  constructor(e) {
    this.qr = e;
  }
}
function Pw(r) {
  const e = cD({
    parent: r.parent,
    structuredQuery: r.structuredQuery
  });
  return r.limitType === "LAST" ? za(
    e,
    e.limit,
    "L"
    /* LimitType.Last */
  ) : e;
}
class Sw {
  constructor() {
    this.Yi = new Ow();
  }
  addToCollectionParentIndex(e, t) {
    return this.Yi.add(t), k.resolve();
  }
  getCollectionParents(e, t) {
    return k.resolve(this.Yi.getEntries(t));
  }
  addFieldIndex(e, t) {
    return k.resolve();
  }
  deleteFieldIndex(e, t) {
    return k.resolve();
  }
  deleteAllFieldIndexes(e) {
    return k.resolve();
  }
  createTargetIndexes(e, t) {
    return k.resolve();
  }
  getDocumentsMatchingTarget(e, t) {
    return k.resolve(null);
  }
  getIndexType(e, t) {
    return k.resolve(
      0
      /* IndexType.NONE */
    );
  }
  getFieldIndexes(e, t) {
    return k.resolve([]);
  }
  getNextCollectionGroupToUpdate(e) {
    return k.resolve(null);
  }
  getMinOffset(e, t) {
    return k.resolve(Rn.min());
  }
  getMinOffsetFromCollectionGroup(e, t) {
    return k.resolve(Rn.min());
  }
  updateCollectionGroup(e, t, n) {
    return k.resolve();
  }
  updateIndexEntries(e, t) {
    return k.resolve();
  }
}
class Ow {
  constructor() {
    this.index = {};
  }
  // Returns false if the entry already existed.
  add(e) {
    const t = e.lastSegment(), n = e.popLast(), s = this.index[t] || new Ne(he.comparator), i = !s.has(n);
    return this.index[t] = s.add(n), i;
  }
  has(e) {
    const t = e.lastSegment(), n = e.popLast(), s = this.index[t];
    return s && s.has(n);
  }
  getEntries(e) {
    return (this.index[e] || new Ne(he.comparator)).toArray();
  }
}
class On {
  constructor(e) {
    this.gs = e;
  }
  next() {
    return this.gs += 2, this.gs;
  }
  static ys() {
    return new On(0);
  }
  static ws() {
    return new On(-1);
  }
}
function Uf(r, e) {
  let t = e;
  for (const n of r.stages) t = Nw({
    serializer: r.serializer,
    serverTimestampBehavior: r.listenOptions?.serverTimestampBehavior
  }, n, t);
  return t;
}
function Go(r, e) {
  return Uf(r, [e]).length > 0;
}
function bw(r, e) {
  return Ve(r) ? Go(r, e) : Po(r, e);
}
function Nw(r, e, t) {
  if (e instanceof Lo) return (function(s, i, o) {
    return o.filter(((B) => B.isFoundDocument() && `/${B.key.getCollectionPath().canonicalString()}` === i.Er));
  })(0, e, t);
  if (e instanceof VB) return (function(s, i, o) {
    return o.filter(((B) => {
      const u = ys(Z(i.condition).evaluate(s, B));
      return u !== void 0 && Dt(u, at);
    }));
  })(r, e, t);
  if (e instanceof ko) return (function(s, i, o) {
    return o.filter(((B) => B.isFoundDocument() && B.key.getCollectionPath().lastSegment() === i.collectionId));
  })(0, e, t);
  if (e instanceof LB) return (function(s, i, o) {
    return o.filter(((B) => B.isFoundDocument()));
  })(0, 0, t);
  if (e instanceof kB) return (function(s, i, o) {
    return o.filter(((B) => B.isFoundDocument() && i.Tr.has(B.key.path.toStringWithLeadingSlash())));
  })(0, e, t);
  if (e instanceof Hs) return (function(s, i, o) {
    return o.slice(0, i.limit);
  })(0, e, t);
  if (e instanceof xB) return (function(s, i, o) {
    const B = i.orderings.map(((u) => ({
      Os: Z(u.expr),
      direction: u.direction
    })));
    return [...o].sort(((u, c) => {
      for (const { Os: C, direction: f } of B) {
        const m = ys(C.evaluate(s, u)), R = ys(C.evaluate(s, c)), P = Bt(m ?? Sr, R ?? Sr);
        if (P !== 0)
          return f === "ascending" ? P : -P;
      }
      return 0;
    }));
  })(r, e, t);
  throw new Error(`Unknown stage: ${e._name}`);
}
function Za(r) {
  const e = (function(n) {
    for (let s = n.stages.length - 1; s >= 0; s--) {
      const i = n.stages[s];
      if (i instanceof xB) return i.orderings;
    }
    throw new Error("Pipeline must contain at least one Sort stage");
  })(r);
  return (t, n) => {
    for (const s of e) {
      const i = ys(Z(s.expr).evaluate({
        serializer: r.serializer
      }, t)), o = ys(Z(s.expr).evaluate({
        serializer: r.serializer
      }, n)), B = Bt(i || Sr, o || Sr);
      if (B !== 0) return s.direction === "ascending" ? B : -B;
    }
    return 0;
  };
}
function Ra(r) {
  for (let e = r.stages.length - 1; e >= 0; e--) {
    const t = r.stages[e];
    if (t instanceof Hs) return {
      limit: t.limit
    };
  }
}
class Fw {
  constructor() {
    this.changes = new sr(((e) => e.toString()), ((e, t) => e.isEqual(t))), this.changesApplied = !1;
  }
  /**
   * Buffers a `RemoteDocumentCache.addEntry()` call.
   *
   * You can only modify documents that have already been retrieved via
   * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
   */
  addEntry(e) {
    this.assertNotApplied(), this.changes.set(e.key, e);
  }
  /**
   * Buffers a `RemoteDocumentCache.removeEntry()` call.
   *
   * You can only remove documents that have already been retrieved via
   * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
   */
  removeEntry(e, t) {
    this.assertNotApplied(), this.changes.set(e, Ge.newInvalidDocument(e).setReadTime(t));
  }
  /**
   * Looks up an entry in the cache. The buffered changes will first be checked,
   * and if no buffered change applies, this will forward to
   * `RemoteDocumentCache.getEntry()`.
   *
   * @param transaction - The transaction in which to perform any persistence
   *     operations.
   * @param documentKey - The key of the entry to look up.
   * @returns The cached document or an invalid document if we have nothing
   * cached.
   */
  getEntry(e, t) {
    this.assertNotApplied();
    const n = this.changes.get(t);
    return n !== void 0 ? k.resolve(n) : this.getFromCache(e, t);
  }
  /**
   * Looks up several entries in the cache, forwarding to
   * `RemoteDocumentCache.getEntry()`.
   *
   * @param transaction - The transaction in which to perform any persistence
   *     operations.
   * @param documentKeys - The keys of the entries to look up.
   * @returns A map of cached documents, indexed by key. If an entry cannot be
   *     found, the corresponding key will be mapped to an invalid document.
   */
  getEntries(e, t) {
    return this.getAllFromCache(e, t);
  }
  /**
   * Applies buffered changes to the underlying RemoteDocumentCache, using
   * the provided transaction.
   */
  apply(e) {
    return this.assertNotApplied(), this.changesApplied = !0, this.applyChanges(e);
  }
  /** Helper to assert this.changes is not null  */
  assertNotApplied() {
  }
}
class Lw {
  constructor(e, t) {
    this.overlayedDocument = e, this.mutatedFields = t;
  }
}
class kw {
  constructor(e, t, n, s) {
    this.remoteDocumentCache = e, this.mutationQueue = t, this.documentOverlayCache = n, this.indexManager = s;
  }
  /**
   * Get the local view of the document identified by `key`.
   *
   * @returns Local view of the document or null if we don't have any cached
   * state for it.
   */
  getDocument(e, t) {
    let n = null;
    return this.documentOverlayCache.getOverlay(e, t).next(((s) => (n = s, this.remoteDocumentCache.getEntry(e, t)))).next(((s) => (n !== null && Es(n.mutation, s, dt.empty(), _e.now()), s)));
  }
  /**
   * Gets the local view of the documents identified by `keys`.
   *
   * If we don't have cached state for a document in `keys`, a NoDocument will
   * be stored for that key in the resulting set.
   */
  getDocuments(e, t) {
    return this.remoteDocumentCache.getEntries(e, t).next(((n) => this.getLocalViewOfDocuments(e, n, ie()).next((() => n))));
  }
  /**
   * Similar to `getDocuments`, but creates the local view from the given
   * `baseDocs` without retrieving documents from the local store.
   *
   * @param transaction - The transaction this operation is scoped to.
   * @param docs - The documents to apply local mutations to get the local views.
   * @param existenceStateChanged - The set of document keys whose existence state
   *   is changed. This is useful to determine if some documents overlay needs
   *   to be recalculated.
   */
  getLocalViewOfDocuments(e, t, n = ie()) {
    const s = Cn();
    return this.populateOverlays(e, s, t).next((() => this.computeViews(e, t, s, n).next(((i) => {
      let o = dr();
      return i.forEach(((B, u) => {
        o = o.insert(B, u.overlayedDocument);
      })), o;
    }))));
  }
  /**
   * Gets the overlayed documents for the given document map, which will include
   * the local view of those documents and a `FieldMask` indicating which fields
   * are mutated locally, `null` if overlay is a Set or Delete mutation.
   */
  getOverlayedDocuments(e, t) {
    const n = Cn();
    return this.populateOverlays(e, n, t).next((() => this.computeViews(e, t, n, ie())));
  }
  /**
   * Fetches the overlays for {@code docs} and adds them to provided overlay map
   * if the map does not already contain an entry for the given document key.
   */
  populateOverlays(e, t, n) {
    const s = [];
    return n.forEach(((i) => {
      t.has(i) || s.push(i);
    })), this.documentOverlayCache.getOverlays(e, s).next(((i) => {
      i.forEach(((o, B) => {
        t.set(o, B);
      }));
    }));
  }
  /**
   * Computes the local view for the given documents.
   *
   * @param docs - The documents to compute views for. It also has the base
   *   version of the documents.
   * @param overlays - The overlays that need to be applied to the given base
   *   version of the documents.
   * @param existenceStateChanged - A set of documents whose existence states
   *   might have changed. This is used to determine if we need to re-calculate
   *   overlays from mutation queues.
   * @returns A map represents the local documents view.
   */
  computeViews(e, t, n, s) {
    let i = it();
    const o = Is(), B = (function() {
      return Is();
    })();
    return t.forEach(((u, c) => {
      const C = n.get(c.key);
      s.has(c.key) && (C === void 0 || C.mutation instanceof kn) ? i = i.insert(c.key, c) : C !== void 0 ? (o.set(c.key, C.mutation.getFieldMask()), Es(C.mutation, c, C.mutation.getFieldMask(), _e.now())) : (
        // no overlay exists
        // Using EMPTY to indicate there is no overlay for the document.
        o.set(c.key, dt.empty())
      );
    })), this.recalculateAndSaveOverlays(e, i).next(((u) => (u.forEach(((c, C) => o.set(c, C))), t.forEach(((c, C) => B.set(c, new Lw(C, o.get(c) ?? null)))), B)));
  }
  recalculateAndSaveOverlays(e, t) {
    const n = Is();
    let s = new Ie(((o, B) => o - B)), i = ie();
    return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e, t).next(((o) => {
      for (const B of o) B.keys().forEach(((u) => {
        const c = t.get(u);
        if (c === null) return;
        let C = n.get(u) || dt.empty();
        C = B.applyToLocalView(c, C), n.set(u, C);
        const f = (s.get(B.batchId) || ie()).add(u);
        s = s.insert(B.batchId, f);
      }));
    })).next((() => {
      const o = [], B = s.getReverseIterator();
      for (; B.hasNext(); ) {
        const u = B.getNext(), c = u.key, C = u.value, f = YC();
        C.forEach(((m) => {
          if (!i.has(m)) {
            const R = FC(t.get(m), n.get(m));
            R !== null && f.set(m, R), i = i.add(m);
          }
        })), o.push(this.documentOverlayCache.saveOverlays(e, c, f));
      }
      return k.waitFor(o);
    })).next((() => n));
  }
  /**
   * Recalculates overlays by reading the documents from remote document cache
   * first, and saves them after they are calculated.
   */
  recalculateAndSaveOverlaysForDocumentKeys(e, t) {
    return this.remoteDocumentCache.getEntries(e, t).next(((n) => this.recalculateAndSaveOverlays(e, n)));
  }
  /**
   * Performs a query against the local view of all documents.
   *
   * @param transaction - The persistence transaction.
   * @param query - The query to match documents against.
   * @param offset - Read time and key to start scanning by (exclusive).
   * @param context - A optional tracker to keep a record of important details
   *   during database local query execution.
   */
  getDocumentsMatchingQuery(e, t, n, s) {
    return Ve(t) ? this.getDocumentsMatchingPipeline(e, t, n, s) : H_(t) ? this.getDocumentsMatchingDocumentQuery(e, t.path) : KC(t) ? this.getDocumentsMatchingCollectionGroupQuery(e, t, n, s) : this.getDocumentsMatchingCollectionQuery(e, t, n, s);
  }
  /**
   * Given a collection group, returns the next documents that follow the provided offset, along
   * with an updated batch ID.
   *
   * <p>The documents returned by this method are ordered by remote version from the provided
   * offset. If there are no more remote documents after the provided offset, documents with
   * mutations in order of batch id from the offset are returned. Since all documents in a batch are
   * returned together, the total number of documents returned can exceed {@code count}.
   *
   * @param transaction
   * @param collectionGroup - The collection group for the documents.
   * @param offset - The offset to index into.
   * @param count - The number of documents to return
   * @returns A LocalWriteResult with the documents that follow the provided offset and the last processed batch id.
   */
  getNextDocuments(e, t, n, s) {
    return this.remoteDocumentCache.getAllFromCollectionGroup(e, t, n, s).next(((i) => {
      const o = s - i.size > 0 ? this.documentOverlayCache.getOverlaysForCollectionGroup(e, t, n.largestBatchId, s - i.size) : k.resolve(Cn());
      let B = Vs, u = i;
      return o.next(((c) => k.forEach(c, ((C, f) => (B < f.largestBatchId && (B = f.largestBatchId), i.get(C) ? k.resolve() : this.remoteDocumentCache.getEntry(e, C).next(((m) => {
        u = u.insert(C, m);
      }))))).next((() => this.populateOverlays(e, c, i))).next((() => this.computeViews(e, u, c, ie()))).next(((C) => ({
        batchId: B,
        changes: $C(C)
      })))));
    }));
  }
  getDocumentsMatchingDocumentQuery(e, t) {
    return this.getDocument(e, new Y(t)).next(((n) => {
      let s = dr();
      return n.isFoundDocument() && (s = s.insert(n.key, n)), s;
    }));
  }
  getDocumentsMatchingCollectionGroupQuery(e, t, n, s) {
    const i = t.collectionGroup;
    let o = dr();
    return this.indexManager.getCollectionParents(e, i).next(((B) => k.forEach(B, ((u) => {
      const c = (function(f, m) {
        return new si(
          m,
          /*collectionGroup=*/
          null,
          f.explicitOrderBy.slice(),
          f.filters.slice(),
          f.limit,
          f.limitType,
          f.startAt,
          f.endAt
        );
      })(t, u.child(i));
      return this.getDocumentsMatchingCollectionQuery(e, c, n, s).next(((C) => {
        C.forEach(((f, m) => {
          o = o.insert(f, m);
        }));
      }));
    })).next((() => o))));
  }
  getDocumentsMatchingCollectionQuery(e, t, n, s) {
    let i;
    return this.documentOverlayCache.getOverlaysForCollection(e, t.path, n.largestBatchId).next(((o) => (i = o, this.remoteDocumentCache.getDocumentsMatchingQuery(e, t, n, i, s)))).next(((o) => this.retrieveMatchingLocalDocuments(i, o, ((B) => Po(t, B)))));
  }
  getDocumentsMatchingPipeline(e, t, n, s) {
    if (Dn(t) === "collection_group") {
      const i = GB(t);
      let o = dr();
      return this.indexManager.getCollectionParents(e, i).next(((B) => k.forEach(B, ((u) => {
        const c = (function(f, m) {
          const R = f.stages.map(((P) => P instanceof ko ? new Lo(m.canonicalString(), {}) : P));
          return new st(f.serializer, R);
        })(t, u.child(i));
        return this.getDocumentsMatchingPipeline(e, c, n, s).next(((C) => {
          C.forEach(((f, m) => {
            o = o.insert(f, m);
          }));
        }));
      })).next((() => o))));
    }
    {
      let i;
      return this.getOverlaysForPipeline(e, t, n.largestBatchId).next(((o) => {
        switch (i = o, Dn(t)) {
          case "collection":
            return this.remoteDocumentCache.getDocumentsMatchingQuery(e, t, n, i, s);
          case "documents":
            let B = ie();
            for (const u of Xa(t)) B = B.add(Y.fromPath(u));
            return this.remoteDocumentCache.getEntries(e, B);
          case "database":
            return this.remoteDocumentCache.getAllEntries(e);
          default:
            throw new j("invalid-argument", `Invalid pipeline source to execute offline: ${qt(t)}`);
        }
      })).next(((o) => this.retrieveMatchingLocalDocuments(i, o, ((B) => Go(t, B)))));
    }
  }
  retrieveMatchingLocalDocuments(e, t, n) {
    e.forEach(((i, o) => {
      const B = o.getKey();
      t.get(B) === null && (t = t.insert(B, Ge.newInvalidDocument(B)));
    }));
    let s = dr();
    return t.forEach(((i, o) => {
      const B = e.get(i);
      B !== void 0 && Es(B.mutation, o, dt.empty(), _e.now()), // Finally, insert the documents that still match the query
      n(o) && (s = s.insert(i, o));
    })), s;
  }
  getOverlaysForPipeline(e, t, n) {
    switch (Dn(t)) {
      case "collection":
        return this.documentOverlayCache.getOverlaysForCollection(e, he.fromString(Vo(t)), n);
      case "collection_group":
        throw new j("invalid-argument", `Unexpected collection group pipeline: ${qt(t)}`);
      case "documents":
        return this.documentOverlayCache.getOverlays(e, Xa(t).map(((s) => Y.fromPath(s))));
      case "database":
        return this.documentOverlayCache.getAllOverlays(e, n);
      default:
        throw new j("invalid-argument", `Failed to get overlays for pipeline: ${qt(t)}`);
    }
  }
}
class Vw {
  constructor(e) {
    this.serializer = e, this.Ks = /* @__PURE__ */ new Map(), this.Qs = /* @__PURE__ */ new Map();
  }
  getBundleMetadata(e, t) {
    return k.resolve(this.Ks.get(t));
  }
  saveBundleMetadata(e, t) {
    return this.Ks.set(
      t.id,
      /** Decodes a BundleMetadata proto into a BundleMetadata object. */
      (function(s) {
        return {
          id: s.id,
          version: s.version,
          createTime: mt(s.createTime)
        };
      })(t)
    ), k.resolve();
  }
  getNamedQuery(e, t) {
    return k.resolve(this.Qs.get(t));
  }
  saveNamedQuery(e, t) {
    return this.Qs.set(t.name, (function(s) {
      return {
        name: s.name,
        query: Pw(s.bundledQuery),
        readTime: mt(s.readTime)
      };
    })(t)), k.resolve();
  }
}
class xw {
  constructor() {
    this.overlays = new Ie(Y.comparator), this.Ws = /* @__PURE__ */ new Map();
  }
  getOverlay(e, t) {
    return k.resolve(this.overlays.get(t));
  }
  getOverlays(e, t) {
    const n = Cn();
    return k.forEach(t, ((s) => this.getOverlay(e, s).next(((i) => {
      i !== null && n.set(s, i);
    })))).next((() => n));
  }
  getAllOverlays(e, t) {
    const n = Cn();
    return this.overlays.forEach(((s, i) => {
      i.largestBatchId > t && n.set(s, i);
    })), k.resolve(n);
  }
  saveOverlays(e, t, n) {
    return n.forEach(((s, i) => {
      this.Yr(e, t, i);
    })), k.resolve();
  }
  removeOverlaysForBatchId(e, t, n) {
    const s = this.Ws.get(n);
    return s !== void 0 && (s.forEach(((i) => this.overlays = this.overlays.remove(i))), this.Ws.delete(n)), k.resolve();
  }
  getOverlaysForCollection(e, t, n) {
    const s = Cn(), i = t.length + 1, o = new Y(t.child("")), B = this.overlays.getIteratorFrom(o);
    for (; B.hasNext(); ) {
      const u = B.getNext().value, c = u.getKey();
      if (!t.isPrefixOf(c.path)) break;
      c.path.length === i && u.largestBatchId > n && s.set(u.getKey(), u);
    }
    return k.resolve(s);
  }
  getOverlaysForCollectionGroup(e, t, n, s) {
    let i = new Ie(((c, C) => c - C));
    const o = this.overlays.getIterator();
    for (; o.hasNext(); ) {
      const c = o.getNext().value;
      if (c.getKey().getCollectionGroup() === t && c.largestBatchId > n) {
        let C = i.get(c.largestBatchId);
        C === null && (C = Cn(), i = i.insert(c.largestBatchId, C)), C.set(c.getKey(), c);
      }
    }
    const B = Cn(), u = i.getIterator();
    for (; u.hasNext() && (u.getNext().value.forEach(((c, C) => B.set(c, C))), !(B.size() >= s)); )
      ;
    return k.resolve(B);
  }
  Yr(e, t, n) {
    const s = this.overlays.get(n.key);
    if (s !== null) {
      const o = this.Ws.get(s.largestBatchId).delete(n.key);
      this.Ws.set(s.largestBatchId, o);
    }
    this.overlays = this.overlays.insert(n.key, new Rw(t, n));
    let i = this.Ws.get(t);
    i === void 0 && (i = ie(), this.Ws.set(t, i)), this.Ws.set(t, i.add(n.key));
  }
}
class Mw {
  constructor() {
    this.sessionToken = Fe.EMPTY_BYTE_STRING;
  }
  getSessionToken(e) {
    return k.resolve(this.sessionToken);
  }
  setSessionToken(e, t) {
    return this.sessionToken = t, k.resolve();
  }
}
class QB {
  constructor() {
    this.Gs = new Ne(Me.zs), // A set of outstanding references to a document sorted by target id.
    this.js = new Ne(Me.Hs);
  }
  /** Returns true if the reference set contains no references. */
  isEmpty() {
    return this.Gs.isEmpty();
  }
  /** Adds a reference to the given document key for the given ID. */
  addReference(e, t) {
    const n = new Me(e, t);
    this.Gs = this.Gs.add(n), this.js = this.js.add(n);
  }
  /** Add references to the given document keys for the given ID. */
  Js(e, t) {
    e.forEach(((n) => this.addReference(n, t)));
  }
  /**
   * Removes a reference to the given document key for the given
   * ID.
   */
  removeReference(e, t) {
    this.Ys(new Me(e, t));
  }
  Zs(e, t) {
    e.forEach(((n) => this.removeReference(n, t)));
  }
  /**
   * Clears all references with a given ID. Calls removeRef() for each key
   * removed.
   */
  Xs(e) {
    const t = new Y(new he([])), n = new Me(t, e), s = new Me(t, e + 1), i = [];
    return this.js.forEachInRange([n, s], ((o) => {
      this.Ys(o), i.push(o.key);
    })), i;
  }
  e_() {
    this.Gs.forEach(((e) => this.Ys(e)));
  }
  Ys(e) {
    this.Gs = this.Gs.delete(e), this.js = this.js.delete(e);
  }
  t_(e) {
    const t = new Y(new he([])), n = new Me(t, e), s = new Me(t, e + 1);
    let i = ie();
    return this.js.forEachInRange([n, s], ((o) => {
      i = i.add(o.key);
    })), i;
  }
  containsKey(e) {
    const t = new Me(e, 0), n = this.Gs.firstAfterOrEqual(t);
    return n !== null && e.isEqual(n.key);
  }
}
class Me {
  constructor(e, t) {
    this.key = e, this.n_ = t;
  }
  /** Compare by key then by ID */
  static zs(e, t) {
    return Y.comparator(e.key, t.key) || oe(e.n_, t.n_);
  }
  /** Compare by ID then by key */
  static Hs(e, t) {
    return oe(e.n_, t.n_) || Y.comparator(e.key, t.key);
  }
}
class Gw {
  constructor(e, t) {
    this.indexManager = e, this.referenceDelegate = t, /**
     * The set of all mutations that have been sent but not yet been applied to
     * the backend.
     */
    this.mutationQueue = [], /** Next value to use when assigning sequential IDs to each mutation batch. */
    this.Wr = 1, /** An ordered mapping between documents and the mutations batch IDs. */
    this.r_ = new Ne(Me.zs);
  }
  checkEmpty(e) {
    return k.resolve(this.mutationQueue.length === 0);
  }
  addMutationBatch(e, t, n, s) {
    const i = this.Wr;
    this.Wr++, this.mutationQueue.length > 0 && this.mutationQueue[this.mutationQueue.length - 1];
    const o = new yw(i, t, n, s);
    this.mutationQueue.push(o);
    for (const B of s) this.r_ = this.r_.add(new Me(B.key, i)), this.indexManager.addToCollectionParentIndex(e, B.key.path.popLast());
    return k.resolve(o);
  }
  lookupMutationBatch(e, t) {
    return k.resolve(this.i_(t));
  }
  getNextMutationBatchAfterBatchId(e, t) {
    const n = t + 1, s = this.s_(n), i = s < 0 ? 0 : s;
    return k.resolve(this.mutationQueue.length > i ? this.mutationQueue[i] : null);
  }
  getHighestUnacknowledgedBatchId() {
    return k.resolve(this.mutationQueue.length === 0 ? _B : this.Wr - 1);
  }
  getAllMutationBatches(e) {
    return k.resolve(this.mutationQueue.slice());
  }
  getAllMutationBatchesAffectingDocumentKey(e, t) {
    const n = new Me(t, 0), s = new Me(t, Number.POSITIVE_INFINITY), i = [];
    return this.r_.forEachInRange([n, s], ((o) => {
      const B = this.i_(o.n_);
      i.push(B);
    })), k.resolve(i);
  }
  getAllMutationBatchesAffectingDocumentKeys(e, t) {
    let n = new Ne(oe);
    return t.forEach(((s) => {
      const i = new Me(s, 0), o = new Me(s, Number.POSITIVE_INFINITY);
      this.r_.forEachInRange([i, o], ((B) => {
        n = n.add(B.n_);
      }));
    })), k.resolve(this.__(n));
  }
  getAllMutationBatchesAffectingQuery(e, t) {
    const n = t.path, s = n.length + 1;
    let i = n;
    Y.isDocumentKey(i) || (i = i.child(""));
    const o = new Me(new Y(i), 0);
    let B = new Ne(oe);
    return this.r_.forEachWhile(((u) => {
      const c = u.key.path;
      return !!n.isPrefixOf(c) && // Rows with document keys more than one segment longer than the query
      // path can't be matches. For example, a query on 'rooms' can't match
      // the document /rooms/abc/messages/xyx.
      // TODO(mcg): we'll need a different scanner when we implement
      // ancestor queries.
      (c.length === s && (B = B.add(u.n_)), !0);
    }), o), k.resolve(this.__(B));
  }
  __(e) {
    const t = [];
    return e.forEach(((n) => {
      const s = this.i_(n);
      s !== null && t.push(s);
    })), t;
  }
  removeMutationBatch(e, t) {
    Q(this.o_(t.batchId, "removed") === 0, 55003), this.mutationQueue.shift();
    let n = this.r_;
    return k.forEach(t.mutations, ((s) => {
      const i = new Me(s.key, t.batchId);
      return n = n.delete(i), this.referenceDelegate.markPotentiallyOrphaned(e, s.key);
    })).next((() => {
      this.r_ = n;
    }));
  }
  jr(e) {
  }
  containsKey(e, t) {
    const n = new Me(t, 0), s = this.r_.firstAfterOrEqual(n);
    return k.resolve(t.isEqual(s && s.key));
  }
  performConsistencyCheck(e) {
    return this.mutationQueue.length, k.resolve();
  }
  /**
   * Finds the index of the given batchId in the mutation queue and asserts that
   * the resulting index is within the bounds of the queue.
   *
   * @param batchId - The batchId to search for
   * @param action - A description of what the caller is doing, phrased in passive
   * form (e.g. "acknowledged" in a routine that acknowledges batches).
   */
  o_(e, t) {
    return this.s_(e);
  }
  /**
   * Finds the index of the given batchId in the mutation queue. This operation
   * is O(1).
   *
   * @returns The computed index of the batch with the given batchId, based on
   * the state of the queue. Note this index can be negative if the requested
   * batchId has already been removed from the queue or past the end of the
   * queue if the batchId is larger than the last added batch.
   */
  s_(e) {
    return this.mutationQueue.length === 0 ? 0 : e - this.mutationQueue[0].batchId;
  }
  /**
   * A version of lookupMutationBatch that doesn't return a promise, this makes
   * other functions that uses this code easier to read and more efficient.
   */
  i_(e) {
    const t = this.s_(e);
    return t < 0 || t >= this.mutationQueue.length ? null : this.mutationQueue[t];
  }
}
class Hw {
  /**
   * @param sizer - Used to assess the size of a document. For eager GC, this is
   * expected to just return 0 to avoid unnecessarily doing the work of
   * calculating the size.
   */
  constructor(e) {
    this.a_ = e, /** Underlying cache of documents and their read times. */
    this.docs = (function() {
      return new Ie(Y.comparator);
    })(), /** Size of all cached documents. */
    this.size = 0;
  }
  setIndexManager(e) {
    this.indexManager = e;
  }
  /**
   * Adds the supplied entry to the cache and updates the cache size as appropriate.
   *
   * All calls of `addEntry`  are required to go through the RemoteDocumentChangeBuffer
   * returned by `newChangeBuffer()`.
   */
  addEntry(e, t) {
    const n = t.key, s = this.docs.get(n), i = s ? s.size : 0, o = this.a_(t);
    return this.docs = this.docs.insert(n, {
      document: t.mutableCopy(),
      size: o
    }), this.size += o - i, this.indexManager.addToCollectionParentIndex(e, n.path.popLast());
  }
  /**
   * Removes the specified entry from the cache and updates the cache size as appropriate.
   *
   * All calls of `removeEntry` are required to go through the RemoteDocumentChangeBuffer
   * returned by `newChangeBuffer()`.
   */
  removeEntry(e) {
    const t = this.docs.get(e);
    t && (this.docs = this.docs.remove(e), this.size -= t.size);
  }
  getEntry(e, t) {
    const n = this.docs.get(t);
    return k.resolve(n ? n.document.mutableCopy() : Ge.newInvalidDocument(t));
  }
  getEntries(e, t) {
    let n = it();
    return t.forEach(((s) => {
      const i = this.docs.get(s);
      n = n.insert(s, i ? i.document.mutableCopy() : Ge.newInvalidDocument(s));
    })), k.resolve(n);
  }
  getAllEntries(e) {
    let t = it();
    return this.docs.forEach(((n, s) => {
      t = t.insert(n, s.document);
    })), k.resolve(t);
  }
  getDocumentsMatchingQuery(e, t, n, s) {
    let i, o;
    Ve(t) ? (
      // Documents are ordered by key, so we can use a prefix scan to narrow down
      // the documents we need to match the query against.
      (i = he.fromString(Vo(t)), o = (C) => Go(t, C))
    ) : (
      // Documents are ordered by key, so we can use a prefix scan to narrow down
      // the documents we need to match the query against.
      (i = t.path, o = (C) => Po(t, C))
    );
    let B = it();
    const u = new Y(i.child("__id-9223372036854775808__")), c = this.docs.getIteratorFrom(u);
    for (; c.hasNext(); ) {
      const { key: C, value: { document: f } } = c.getNext();
      if (!i.isPrefixOf(C.path)) break;
      C.path.length > i.length + 1 || x_(V_(f), n) <= 0 || (s.has(f.key) || o(f)) && (B = B.insert(f.key, f.mutableCopy()));
    }
    return k.resolve(B);
  }
  getAllFromCollectionGroup(e, t, n, s) {
    $(9500);
  }
  u_(e, t) {
    return k.forEach(this.docs, ((n) => t(n)));
  }
  newChangeBuffer(e) {
    return new Uw(this);
  }
  getSize(e) {
    return k.resolve(this.size);
  }
}
class Uw extends Fw {
  constructor(e) {
    super(), this.qs = e;
  }
  applyChanges(e) {
    const t = [];
    return this.changes.forEach(((n, s) => {
      s.isValidDocument() ? t.push(this.qs.addEntry(e, s)) : this.qs.removeEntry(n);
    })), k.waitFor(t);
  }
  getFromCache(e, t) {
    return this.qs.getEntry(e, t);
  }
  getAllFromCache(e, t) {
    return this.qs.getEntries(e, t);
  }
}
class Jw {
  constructor(e) {
    this.persistence = e, /**
     * Maps a target to the data about that target
     */
    this.c_ = new sr(((t) => Mf(t)), Gf), /** The last received snapshot version. */
    this.lastRemoteSnapshotVersion = ee.min(), /** The highest numbered target ID encountered. */
    this.highestTargetId = 0, /** The highest sequence number encountered. */
    this.l_ = 0, /**
     * A ordered bidirectional mapping between documents and the remote target
     * IDs.
     */
    this.E_ = new QB(), this.targetCount = 0, this.h_ = On.ys();
  }
  forEachTarget(e, t) {
    return this.c_.forEach(((n, s) => t(s))), k.resolve();
  }
  getLastRemoteSnapshotVersion(e) {
    return k.resolve(this.lastRemoteSnapshotVersion);
  }
  getHighestSequenceNumber(e) {
    return k.resolve(this.l_);
  }
  allocateTargetId(e) {
    return this.highestTargetId = this.h_.next(), k.resolve(this.highestTargetId);
  }
  setTargetsMetadata(e, t, n) {
    return n && (this.lastRemoteSnapshotVersion = n), t > this.l_ && (this.l_ = t), k.resolve();
  }
  vs(e) {
    this.c_.set(e.target, e);
    const t = e.targetId;
    t > this.highestTargetId && (this.h_ = new On(t), this.highestTargetId = t), e.sequenceNumber > this.l_ && (this.l_ = e.sequenceNumber);
  }
  addTargetData(e, t) {
    return this.vs(t), this.targetCount += 1, k.resolve();
  }
  updateTargetData(e, t) {
    return this.vs(t), k.resolve();
  }
  removeTargetData(e, t) {
    return this.c_.delete(t.target), this.E_.Xs(t.targetId), this.targetCount -= 1, k.resolve();
  }
  removeTargets(e, t, n) {
    let s = 0;
    const i = [];
    return this.c_.forEach(((o, B) => {
      B.sequenceNumber <= t && n.get(B.targetId) === null && (this.c_.delete(o), i.push(this.removeMatchingKeysForTargetId(e, B.targetId)), s++);
    })), k.waitFor(i).next((() => s));
  }
  getTargetCount(e) {
    return k.resolve(this.targetCount);
  }
  getTargetData(e, t) {
    const n = this.c_.get(t) || null;
    return k.resolve(n);
  }
  addMatchingKeys(e, t, n) {
    return this.E_.Js(t, n), k.resolve();
  }
  removeMatchingKeys(e, t, n) {
    this.E_.Zs(t, n);
    const s = this.persistence.referenceDelegate, i = [];
    return s && t.forEach(((o) => {
      i.push(s.markPotentiallyOrphaned(e, o));
    })), k.waitFor(i);
  }
  removeMatchingKeysForTargetId(e, t) {
    return this.E_.Xs(t), k.resolve();
  }
  getMatchingKeysForTargetId(e, t) {
    const n = this.E_.t_(t);
    return k.resolve(n);
  }
  containsKey(e, t) {
    return k.resolve(this.E_.containsKey(t));
  }
}
class Jf {
  /**
   * The constructor accepts a factory for creating a reference delegate. This
   * allows both the delegate and this instance to have strong references to
   * each other without having nullable fields that would then need to be
   * checked or asserted on every access.
   */
  constructor(e, t) {
    this.T_ = {}, this.overlays = {}, this.P_ = new Oo(0), this.R_ = !1, this.R_ = !0, this.I_ = new Mw(), this.referenceDelegate = e(this), this.A_ = new Jw(this), this.indexManager = new Sw(), this.remoteDocumentCache = (function(s) {
      return new Hw(s);
    })(((n) => this.referenceDelegate.V_(n))), this.serializer = new vw(t), this.d_ = new Vw(this.serializer);
  }
  start() {
    return Promise.resolve();
  }
  shutdown() {
    return this.R_ = !1, Promise.resolve();
  }
  get started() {
    return this.R_;
  }
  setDatabaseDeletedListener() {
  }
  setNetworkEnabled() {
  }
  getIndexManager(e) {
    return this.indexManager;
  }
  getDocumentOverlayCache(e) {
    let t = this.overlays[e.toKey()];
    return t || (t = new xw(), this.overlays[e.toKey()] = t), t;
  }
  getMutationQueue(e, t) {
    let n = this.T_[e.toKey()];
    return n || (n = new Gw(t, this.referenceDelegate), this.T_[e.toKey()] = n), n;
  }
  getGlobalsCache() {
    return this.I_;
  }
  getTargetCache() {
    return this.A_;
  }
  getRemoteDocumentCache() {
    return this.remoteDocumentCache;
  }
  getBundleCache() {
    return this.d_;
  }
  runTransaction(e, t, n) {
    q("MemoryPersistence", "Starting transaction:", e);
    const s = new jw(this.P_.next());
    return this.referenceDelegate.f_(), n(s).next(((i) => this.referenceDelegate.m_(s).next((() => i)))).toPromise().then(((i) => (s.raiseOnCommittedEvent(), i)));
  }
  p_(e, t) {
    return k.or(Object.values(this.T_).map(((n) => () => n.containsKey(e, t))));
  }
}
class jw extends VD {
  constructor(e) {
    super(), this.currentSequenceNumber = e;
  }
}
class WB {
  constructor(e) {
    this.persistence = e, /** Tracks all documents that are active in Query views. */
    this.g_ = new QB(), /** The list of documents that are potentially GCed after each transaction. */
    this.y_ = null;
  }
  static w_(e) {
    return new WB(e);
  }
  get b_() {
    if (this.y_) return this.y_;
    throw $(60996);
  }
  addReference(e, t, n) {
    return this.g_.addReference(n, t), this.b_.delete(n.toString()), k.resolve();
  }
  removeReference(e, t, n) {
    return this.g_.removeReference(n, t), this.b_.add(n.toString()), k.resolve();
  }
  markPotentiallyOrphaned(e, t) {
    return this.b_.add(t.toString()), k.resolve();
  }
  removeTarget(e, t) {
    this.g_.Xs(t.targetId).forEach(((s) => this.b_.add(s.toString())));
    const n = this.persistence.getTargetCache();
    return n.getMatchingKeysForTargetId(e, t.targetId).next(((s) => {
      s.forEach(((i) => this.b_.add(i.toString())));
    })).next((() => n.removeTargetData(e, t)));
  }
  f_() {
    this.y_ = /* @__PURE__ */ new Set();
  }
  m_(e) {
    const t = this.persistence.getRemoteDocumentCache().newChangeBuffer();
    return k.forEach(this.b_, ((n) => {
      const s = Y.fromPath(n);
      return this.S_(e, s).next(((i) => {
        i || t.removeEntry(s, ee.min());
      }));
    })).next((() => (this.y_ = null, t.apply(e))));
  }
  updateLimboDocument(e, t) {
    return this.S_(e, t).next(((n) => {
      n ? this.b_.delete(t.toString()) : this.b_.add(t.toString());
    }));
  }
  V_(e) {
    return 0;
  }
  S_(e, t) {
    return k.or([() => k.resolve(this.g_.containsKey(t)), () => this.persistence.getTargetCache().containsKey(e, t), () => this.persistence.p_(e, t)]);
  }
}
class fo {
  constructor(e, t) {
    this.persistence = e, this.v_ = new sr(((n) => Tw(n.path)), ((n, s) => n.isEqual(s))), this.garbageCollector = JD(this, t);
  }
  static w_(e, t) {
    return new fo(e, t);
  }
  // No-ops, present so memory persistence doesn't have to care which delegate
  // it has.
  f_() {
  }
  m_(e) {
    return k.resolve();
  }
  forEachTarget(e, t) {
    return this.persistence.getTargetCache().forEachTarget(e, t);
  }
  rr(e) {
    const t = this.xs(e);
    return this.persistence.getTargetCache().getTargetCount(e).next(((n) => t.next(((s) => n + s))));
  }
  xs(e) {
    let t = 0;
    return this.ir(e, ((n) => {
      t++;
    })).next((() => t));
  }
  ir(e, t) {
    return k.forEach(this.v_, ((n, s) => this.Fs(e, n, s).next(((i) => i ? k.resolve() : t(s)))));
  }
  removeTargets(e, t, n) {
    return this.persistence.getTargetCache().removeTargets(e, t, n);
  }
  removeOrphanedDocuments(e, t) {
    let n = 0;
    const s = this.persistence.getRemoteDocumentCache(), i = s.newChangeBuffer();
    return s.u_(e, ((o) => this.Fs(e, o, t).next(((B) => {
      B || (n++, i.removeEntry(o, ee.min()));
    })))).next((() => i.apply(e))).next((() => n));
  }
  markPotentiallyOrphaned(e, t) {
    return this.v_.set(t, e.currentSequenceNumber), k.resolve();
  }
  removeTarget(e, t) {
    const n = t.withSequenceNumber(e.currentSequenceNumber);
    return this.persistence.getTargetCache().updateTargetData(e, n);
  }
  addReference(e, t, n) {
    return this.v_.set(n, e.currentSequenceNumber), k.resolve();
  }
  removeReference(e, t, n) {
    return this.v_.set(n, e.currentSequenceNumber), k.resolve();
  }
  updateLimboDocument(e, t) {
    return this.v_.set(t, e.currentSequenceNumber), k.resolve();
  }
  V_(e) {
    let t = e.key.toString().length;
    return e.isFoundDocument() && (t += ji(e.data.value)), t;
  }
  Fs(e, t, n) {
    return k.or([() => this.persistence.p_(e, t), () => this.persistence.getTargetCache().containsKey(e, t), () => {
      const s = this.v_.get(t);
      return k.resolve(s !== void 0 && s > n);
    }]);
  }
  getCacheSize(e) {
    return this.persistence.getRemoteDocumentCache().getSize(e);
  }
}
class $B {
  constructor(e, t, n, s) {
    this.targetId = e, this.fromCache = t, this.Ao = n, this.Vo = s;
  }
  static fo(e, t) {
    let n = ie(), s = ie();
    for (const i of t.docChanges) switch (i.type) {
      case 0:
        n = n.add(i.doc.key);
        break;
      case 1:
        s = s.add(i.doc.key);
    }
    return new $B(e, t.fromCache, n, s);
  }
}
function qw(r, e) {
  return Y.comparator(r.key, e.key);
}
class Kw {
  constructor() {
    this._documentReadCount = 0;
  }
  get documentReadCount() {
    return this._documentReadCount;
  }
  incrementDocumentReadCount(e) {
    this._documentReadCount += e;
  }
}
class zw {
  constructor() {
    this.mo = !1, this.po = !1, /**
     * SDK only decides whether it should create index when collection size is
     * larger than this.
     */
    this.yo = 100, this.wo = /**
    * This cost represents the evaluation result of
    * (([index, docKey] + [docKey, docContent]) per document in the result set)
    * / ([docKey, docContent] per documents in full collection scan) coming from
    * experiment [enter PR experiment URL here].
    */
    (function() {
      return op() ? 8 : xD(Qe()) > 0 ? 6 : 4;
    })();
  }
  /** Sets the document view to query against. */
  initialize(e, t) {
    this.bo = e, this.indexManager = t, this.mo = !0;
  }
  /** Returns all local documents matching the specified query. */
  getDocumentsMatchingQuery(e, t, n, s) {
    const i = {
      result: null
    };
    return this.So(e, t).next(((o) => {
      i.result = o;
    })).next((() => {
      if (!i.result) return this.vo(e, t, s, n).next(((o) => {
        i.result = o;
      }));
    })).next((() => {
      if (i.result) return;
      const o = new Kw();
      return this.Do(e, t, o).next(((B) => {
        if (i.result = B, this.po) return this.xo(e, t, o, B.size);
      }));
    })).next((() => i.result));
  }
  xo(e, t, n, s) {
    return Ve(t) ? k.resolve() : n.documentReadCount < this.yo ? (Cr() <= ae.DEBUG && q("QueryEngine", "SDK will not create cache indexes for query:", Ds(t), "since it only creates cache indexes for collection contains", "more than or equal to", this.yo, "documents"), k.resolve()) : (Cr() <= ae.DEBUG && q("QueryEngine", "Query:", Ds(t), "scans", n.documentReadCount, "local documents and returns", s, "documents as results."), n.documentReadCount > this.wo * s ? (Cr() <= ae.DEBUG && q("QueryEngine", "The SDK decides to create cache indexes for query:", Ds(t), "as using cache indexes may help improve performance."), this.indexManager.createTargetIndexes(e, Ft(t))) : k.resolve());
  }
  /**
   * Performs an indexed query that evaluates the query based on a collection's
   * persisted index values. Returns `null` if an index is not available.
   */
  So(e, t) {
    if (Ve(t)) return k.resolve(null);
    let n = t;
    if (Ol(n))
      return k.resolve(null);
    let s = Ft(n);
    return this.indexManager.getIndexType(e, s).next(((i) => i === 0 ? null : (n.limit !== null && i === 1 && // We cannot apply a limit for targets that are served using a partial
    // index. If a partial index will be used to serve the target, the
    // query may return a superset of documents that match the target
    // (e.g. if the index doesn't include all the target's filters), or
    // may return the correct set of documents in the wrong order (e.g. if
    // the index doesn't include a segment for one of the orderBys).
    // Therefore, a limit should not be applied in such cases.
    (n = za(
      n,
      null,
      "F"
      /* LimitType.First */
    ), s = Ft(n)), this.indexManager.getDocumentsMatchingTarget(e, s).next(((o) => {
      const B = ie(...o);
      return this.bo.getDocuments(e, B).next(((u) => this.indexManager.getMinOffset(e, s).next(((c) => {
        const C = this.Co(n, u);
        return this.Fo(n, C, B, c.readTime) ? this.So(e, za(
          n,
          null,
          "F"
          /* LimitType.First */
        )) : this.Oo(e, C, n, c);
      }))));
    })))));
  }
  /**
   * Performs a query based on the target's persisted query mapping. Returns
   * `null` if the mapping is not available or cannot be used.
   */
  vo(e, t, n, s) {
    return (Ve(t) ? (function(o) {
      for (const B of o.stages) {
        if (B instanceof Hs || B instanceof zl) return !1;
        if (B instanceof VB) {
          if (B.condition instanceof Af && B.condition._expr.name === "exists" && B.condition._expr.params[0] instanceof Bi && B.condition._expr.params[0].fieldName === vr) continue;
          return !1;
        }
      }
      return !0;
    })(t) : Ol(t)) || s.isEqual(ee.min()) ? k.resolve(null) : this.bo.getDocuments(e, n).next(((i) => {
      const o = this.Co(t, i);
      return this.Fo(t, o, n, s) ? k.resolve(null) : (Cr() <= ae.DEBUG && q("QueryEngine", "Re-using previous result from %s to execute query: %s", s.toString(), Ql(t)), this.Oo(e, o, t, k_(s, Vs)).next(((B) => B)));
    }));
  }
  /** Applies the query filter and sorting to the provided documents.  */
  Co(e, t) {
    let n, s;
    return Ve(e) ? (
      // TODO(pipeline): the order here does not actually matter, not until we implement
      // refill logic for pipelines as well.
      (n = new Ne(qw), s = (i) => Go(e, i))
    ) : (
      // Sort the documents and re-apply the query filter since previously
      // matching documents do not necessarily still match the query.
      (n = new Ne(AB(e)), s = (i) => Po(e, i))
    ), t.forEach(((i, o) => {
      s(o) && (n = n.add(o));
    })), n;
  }
  /**
   * Determines if a limit query needs to be refilled from cache, making it
   * ineligible for index-free execution.
   *
   * @param query - The query.
   * @param sortedPreviousResults - The documents that matched the query when it
   * was last synchronized, sorted by the query's comparator.
   * @param remoteKeys - The document keys that matched the query at the last
   * snapshot.
   * @param limboFreeSnapshotVersion - The version of the snapshot when the
   * query was last synchronized.
   */
  Fo(e, t, n, s) {
    if (Ve(e)) return (function(B) {
      return B.stages.some(((u) => u instanceof Hs || u instanceof zl));
    })(e);
    if (e.limit === null)
      return !1;
    if (n.size !== t.size)
      return !0;
    const i = e.limitType === "F" ? t.last() : t.first();
    return !!i && (i.hasPendingWrites || i.version.compareTo(s) > 0);
  }
  Do(e, t, n) {
    return Cr() <= ae.DEBUG && q("QueryEngine", "Using full collection scan to execute query:", Ql(t)), this.bo.getDocumentsMatchingQuery(e, t, Rn.min(), n);
  }
  /**
   * Combines the results from an indexed execution with the remaining documents
   * that have not yet been indexed.
   */
  Oo(e, t, n, s) {
    return this.bo.getDocumentsMatchingQuery(e, n, s).next(((i) => (
      // Merge with existing results
      (t.forEach(((o) => {
        i = i.insert(o.key, o);
      })), i)
    )));
  }
}
const YB = "LocalStore", Qw = 3e8;
class Ww {
  constructor(e, t, n, s) {
    this.persistence = e, this.Mo = t, this.serializer = s, /**
     * Maps a targetID to data about its target.
     *
     * PORTING NOTE: We are using an immutable data structure on Web to make re-runs
     * of `applyRemoteEvent()` idempotent.
     */
    this.No = new Ie(oe), /** Maps a target to its targetID. */
    // TODO(wuandy): Evaluate if TargetId can be part of Target.
    this.Lo = new sr(((i) => Mf(i)), Gf), /**
     * A per collection group index of the last read time processed by
     * `getNewDocumentChanges()`.
     *
     * PORTING NOTE: This is only used for multi-tab synchronization.
     */
    this.Bo = /* @__PURE__ */ new Map(), this.Uo = e.getRemoteDocumentCache(), this.A_ = e.getTargetCache(), this.d_ = e.getBundleCache(), this.ko(n);
  }
  ko(e) {
    this.documentOverlayCache = this.persistence.getDocumentOverlayCache(e), this.indexManager = this.persistence.getIndexManager(e), this.mutationQueue = this.persistence.getMutationQueue(e, this.indexManager), this.localDocuments = new kw(this.Uo, this.mutationQueue, this.documentOverlayCache, this.indexManager), this.Uo.setIndexManager(this.indexManager), this.Mo.initialize(this.localDocuments, this.indexManager);
  }
  collectGarbage(e) {
    return this.persistence.runTransaction("Collect garbage", "readwrite-primary", ((t) => e.collect(t, this.No)));
  }
}
function $w(r, e, t, n) {
  return new Ww(r, e, t, n);
}
async function jf(r, e) {
  const t = ne(r);
  return await t.persistence.runTransaction("Handle user change", "readonly", ((n) => {
    let s;
    return t.mutationQueue.getAllMutationBatches(n).next(((i) => (s = i, t.ko(e), t.mutationQueue.getAllMutationBatches(n)))).next(((i) => {
      const o = [], B = [];
      let u = ie();
      for (const c of s) {
        o.push(c.batchId);
        for (const C of c.mutations) u = u.add(C.key);
      }
      for (const c of i) {
        B.push(c.batchId);
        for (const C of c.mutations) u = u.add(C.key);
      }
      return t.localDocuments.getDocuments(n, u).next(((c) => ({
        qo: c,
        removedBatchIds: o,
        addedBatchIds: B
      })));
    }));
  }));
}
function Yw(r, e) {
  const t = ne(r);
  return t.persistence.runTransaction("Acknowledge batch", "readwrite-primary", ((n) => {
    const s = e.batch.keys(), i = t.Uo.newChangeBuffer({
      trackRemovals: !0
    });
    return (function(B, u, c, C) {
      const f = c.batch, m = f.keys();
      let R = k.resolve();
      return m.forEach(((P) => {
        R = R.next((() => C.getEntry(u, P))).next(((x) => {
          const H = c.docVersions.get(P);
          Q(H !== null, 48541), x.version.compareTo(H) < 0 && (f.applyToRemoteDocument(x, c), x.isValidDocument() && // We use the commitVersion as the readTime rather than the
          // document's updateTime since the updateTime is not advanced
          // for updates that do not modify the underlying document.
          (x.setReadTime(c.commitVersion), C.addEntry(x)));
        }));
      })), R.next((() => B.mutationQueue.removeMutationBatch(u, f)));
    })(t, n, e, i).next((() => i.apply(n))).next((() => t.mutationQueue.performConsistencyCheck(n))).next((() => t.documentOverlayCache.removeOverlaysForBatchId(n, s, e.batch.batchId))).next((() => t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(n, (function(B) {
      let u = ie();
      for (let c = 0; c < B.mutationResults.length; ++c)
        B.mutationResults[c].transformResults.length > 0 && (u = u.add(B.batch.mutations[c].key));
      return u;
    })(e)))).next((() => t.localDocuments.getDocuments(n, s)));
  }));
}
function qf(r) {
  const e = ne(r);
  return e.persistence.runTransaction("Get last remote snapshot version", "readonly", ((t) => e.A_.getLastRemoteSnapshotVersion(t)));
}
function Xw(r, e) {
  const t = ne(r), n = e.snapshotVersion;
  let s = t.No;
  return t.persistence.runTransaction("Apply remote event", "readwrite-primary", ((i) => {
    const o = t.Uo.newChangeBuffer({
      trackRemovals: !0
    });
    s = t.No;
    const B = [];
    e.targetChanges.forEach(((C, f) => {
      const m = s.get(f);
      if (!m) return;
      B.push(t.A_.removeMatchingKeys(i, C.removedDocuments, f).next((() => t.A_.addMatchingKeys(i, C.addedDocuments, f))));
      let R = m.withSequenceNumber(i.currentSequenceNumber);
      e.targetMismatches.get(f) !== null ? R = R.withResumeToken(Fe.EMPTY_BYTE_STRING, ee.min()).withLastLimboFreeSnapshotVersion(ee.min()) : C.resumeToken.approximateByteSize() > 0 && (R = R.withResumeToken(C.resumeToken, n)), s = s.insert(f, R), // Update the target data if there are target changes (or if
      // sufficient time has passed since the last update).
      /**
      * Returns true if the newTargetData should be persisted during an update of
      * an active target. TargetData should always be persisted when a target is
      * being released and should not call this function.
      *
      * While the target is active, TargetData updates can be omitted when nothing
      * about the target has changed except metadata like the resume token or
      * snapshot version. Occasionally it's worth the extra write to prevent these
      * values from getting too stale after a crash, but this doesn't have to be
      * too frequent.
      */
      (function(x, H, z) {
        return x.resumeToken.approximateByteSize() === 0 || H.snapshotVersion.toMicroseconds() - x.snapshotVersion.toMicroseconds() >= Qw ? !0 : z.addedDocuments.size + z.modifiedDocuments.size + z.removedDocuments.size > 0;
      })(m, R, C) && B.push(t.A_.updateTargetData(i, R));
    }));
    let u = it(), c = ie();
    if (e.documentUpdates.forEach(((C) => {
      e.resolvedLimboDocuments.has(C) && B.push(t.persistence.referenceDelegate.updateLimboDocument(i, C));
    })), // Each loop iteration only affects its "own" doc, so it's safe to get all
    // the remote documents in advance in a single call.
    B.push(Zw(i, o, e.documentUpdates).next(((C) => {
      u = C.$o, c = C.Ko;
    }))), !n.isEqual(ee.min())) {
      const C = t.A_.getLastRemoteSnapshotVersion(i).next(((f) => t.A_.setTargetsMetadata(i, i.currentSequenceNumber, n)));
      B.push(C);
    }
    return k.waitFor(B).next((() => o.apply(i))).next((() => t.localDocuments.getLocalViewOfDocuments(i, u, c))).next((() => u));
  })).then(((i) => (t.No = s, i)));
}
function Zw(r, e, t) {
  let n = ie(), s = ie();
  return t.forEach(((i) => n = n.add(i))), e.getEntries(r, n).next(((i) => {
    let o = it();
    return t.forEach(((B, u) => {
      const c = i.get(B);
      u.isFoundDocument() !== c.isFoundDocument() && (s = s.add(B)), // Note: The order of the steps below is important, since we want
      // to ensure that rejected limbo resolutions (which fabricate
      // NoDocuments with SnapshotVersion.min()) never add documents to
      // cache.
      u.isNoDocument() && u.version.isEqual(ee.min()) ? (
        // NoDocuments with SnapshotVersion.min() are used in manufactured
        // events. We remove these documents from cache since we lost
        // access.
        (e.removeEntry(B, u.readTime), o = o.insert(B, u))
      ) : !c.isValidDocument() || u.version.compareTo(c.version) > 0 || u.version.compareTo(c.version) === 0 && c.hasPendingWrites ? (e.addEntry(u), o = o.insert(B, u)) : q(YB, "Ignoring outdated watch update for ", B, ". Current version:", c.version, " Watch version:", u.version);
    })), {
      $o: o,
      Ko: s
    };
  }));
}
function ey(r, e) {
  const t = ne(r);
  return t.persistence.runTransaction("Get next mutation batch", "readonly", ((n) => (e === void 0 && (e = _B), t.mutationQueue.getNextMutationBatchAfterBatchId(n, e))));
}
function ty(r, e) {
  const t = ne(r);
  return t.persistence.runTransaction("Allocate target", "readwrite", ((n) => {
    let s;
    return t.A_.getTargetData(n, e).next(((i) => i ? (
      // This target has been listened to previously, so reuse the
      // previous targetID.
      // TODO(mcg): freshen last accessed date?
      (s = i, k.resolve(s))
    ) : t.A_.allocateTargetId(n).next(((o) => (s = new Jt(e, o, "TargetPurposeListen", n.currentSequenceNumber), t.A_.addTargetData(n, s).next((() => s)))))));
  })).then(((n) => {
    const s = t.No.get(n.targetId);
    return (s === null || n.snapshotVersion.compareTo(s.snapshotVersion) > 0) && (t.No = t.No.insert(n.targetId, n), t.Lo.set(e, n.targetId)), n;
  }));
}
async function eB(r, e, t) {
  const n = ne(r), s = n.No.get(e), i = t ? "readwrite" : "readwrite-primary";
  try {
    t || await n.persistence.runTransaction("Release target", i, ((o) => n.persistence.referenceDelegate.removeTarget(o, s)));
  } catch (o) {
    if (!Gr(o)) throw o;
    q(YB, `Failed to update sequence numbers for target ${e}: ${o}`);
  }
  n.No = n.No.remove(e), // TODO(pipeline): This needs to handle pipeline properly.
  n.Lo.delete(s.target);
}
function $l(r, e, t) {
  const n = ne(r);
  let s = ee.min(), i = ie();
  return n.persistence.runTransaction(
    "Execute query",
    "readwrite",
    // Use readwrite instead of readonly so indexes can be created
    // Use readwrite instead of readonly so indexes can be created
    ((o) => (function(u, c, C) {
      const f = ne(u), m = f.Lo.get(C);
      return m !== void 0 ? k.resolve(f.No.get(m)) : f.A_.getTargetData(c, C);
    })(n, o, Ve(e) ? e : Ft(e)).next(((B) => {
      if (B) return s = B.lastLimboFreeSnapshotVersion, n.A_.getMatchingKeysForTargetId(o, B.targetId).next(((u) => {
        i = u;
      }));
    })).next((() => n.Mo.getDocumentsMatchingQuery(o, e, t ? s : ee.min(), t ? i : ie()))).next(((B) => (
      // TODO(pipeline): this needs to be adapted to support other pipeline flavors.
      // For now, only 'exact' flavor is supported and it is enough.
      (ny(n, B), {
        documents: B,
        Qo: i
      })
    ))))
  );
}
function ny(r, e) {
  e.forEach(((t, n) => {
    const s = n.key.getCollectionGroup(), i = r.Bo.get(s) || ee.min();
    n.readTime.compareTo(i) > 0 && r.Bo.set(s, n.readTime);
  }));
}
class ry {
  constructor(e, t) {
    this.asyncQueue = e, this.onlineStateHandler = t, /** The current OnlineState. */
    this.state = "Unknown", /**
     * A count of consecutive failures to open the stream. If it reaches the
     * maximum defined by MAX_WATCH_STREAM_FAILURES, we'll set the OnlineState to
     * Offline.
     */
    this.Jo = 0, /**
     * A timer that elapses after ONLINE_STATE_TIMEOUT_MS, at which point we
     * transition from OnlineState.Unknown to OnlineState.Offline without waiting
     * for the stream to actually fail (MAX_WATCH_STREAM_FAILURES times).
     */
    this.Yo = null, /**
     * Whether the client should log a warning message if it fails to connect to
     * the backend (initially true, cleared after a successful stream, or if we've
     * logged the message already).
     */
    this.Zo = !0;
  }
  /**
   * Called by RemoteStore when a watch stream is started (including on each
   * backoff attempt).
   *
   * If this is the first attempt, it sets the OnlineState to Unknown and starts
   * the onlineStateTimer.
   */
  Xo() {
    this.Jo === 0 && (this.ea(
      "Unknown"
      /* OnlineState.Unknown */
    ), this.Yo = this.asyncQueue.enqueueAfterDelay("online_state_timeout", 1e4, (() => (this.Yo = null, this.ta("Backend didn't respond within 10 seconds."), this.ea(
      "Offline"
      /* OnlineState.Offline */
    ), Promise.resolve()))));
  }
  /**
   * Updates our OnlineState as appropriate after the watch stream reports a
   * failure. The first failure moves us to the 'Unknown' state. We then may
   * allow multiple failures (based on MAX_WATCH_STREAM_FAILURES) before we
   * actually transition to the 'Offline' state.
   */
  na(e) {
    this.state === "Online" ? this.ea(
      "Unknown"
      /* OnlineState.Unknown */
    ) : (this.Jo++, this.Jo >= 1 && (this.ra(), this.ta(`Connection failed 1 times. Most recent error: ${e.toString()}`), this.ea(
      "Offline"
      /* OnlineState.Offline */
    )));
  }
  /**
   * Explicitly sets the OnlineState to the specified state.
   *
   * Note that this resets our timers / failure counters, etc. used by our
   * Offline heuristics, so must not be used in place of
   * handleWatchStreamStart() and handleWatchStreamFailure().
   */
  set(e) {
    this.ra(), this.Jo = 0, e === "Online" && // We've connected to watch at least once. Don't warn the developer
    // about being offline going forward.
    (this.Zo = !1), this.ea(e);
  }
  ea(e) {
    e !== this.state && (this.state = e, this.onlineStateHandler(e));
  }
  ta(e) {
    const t = `Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;
    this.Zo ? (Qt(t), this.Zo = !1) : q("OnlineStateTracker", t);
  }
  ra() {
    this.Yo !== null && (this.Yo.cancel(), this.Yo = null);
  }
}
const Vt = "RemoteStore";
class sy {
  constructor(e, t, n, s, i) {
    this.localStore = e, this.datastore = t, this.asyncQueue = n, this.remoteSyncer = {}, /**
     * A list of up to MAX_PENDING_WRITES writes that we have fetched from the
     * LocalStore via fillWritePipeline() and have or will send to the write
     * stream.
     *
     * Whenever writePipeline.length > 0 the RemoteStore will attempt to start or
     * restart the write stream. When the stream is established the writes in the
     * pipeline will be sent in order.
     *
     * Writes remain in writePipeline until they are acknowledged by the backend
     * and thus will automatically be re-sent if the stream is interrupted /
     * restarted before they're acknowledged.
     *
     * Write responses from the backend are linked to their originating request
     * purely based on order, and so we can just shift() writes from the front of
     * the writePipeline as we receive responses.
     */
    this.ia = [], /**
     * A mapping of watched targets that the client cares about tracking and the
     * user has explicitly called a 'listen' for this target.
     *
     * These targets may or may not have been sent to or acknowledged by the
     * server. On re-establishing the listen stream, these targets should be sent
     * to the server. The targets removed with unlistens are removed eagerly
     * without waiting for confirmation from the listen stream.
     */
    this.sa = /* @__PURE__ */ new Map(), this._a = /* @__PURE__ */ new Map(), this.oa = /* @__PURE__ */ new Map(), this.aa = new On(1e3), this.ua = new On(1001), /**
     * A set of reasons for why the RemoteStore may be offline. If empty, the
     * RemoteStore may start its network connections.
     */
    this.ca = /* @__PURE__ */ new Set(), /**
     * Event handlers that get called when the network is disabled or enabled.
     *
     * PORTING NOTE: These functions are used on the Web client to create the
     * underlying streams (to support tree-shakeable streams). On Android and iOS,
     * the streams are created during construction of RemoteStore.
     */
    this.la = [], this.Ea = i, this.Ea.Ke(((o) => {
      n.enqueueAndForget((async () => {
        or(this) && (q(Vt, "Restarting streams for network reachability change."), await (async function(u) {
          const c = ne(u);
          c.ca.add(
            4
            /* OfflineCause.ConnectivityChange */
          ), await ci(c), c.ha.set(
            "Unknown"
            /* OnlineState.Unknown */
          ), c.ca.delete(
            4
            /* OfflineCause.ConnectivityChange */
          ), await Ho(c);
        })(this));
      }));
    })), this.ha = new ry(n, s);
  }
}
async function Ho(r) {
  if (or(r)) for (const e of r.la) await e(
    /* enabled= */
    !0
  );
}
async function ci(r) {
  for (const e of r.la) await e(
    /* enabled= */
    !1
  );
}
function tB(r, e) {
  return r._a.get(e) || void 0;
}
function Kf(r, e) {
  const t = ne(r), n = tB(t, e.targetId);
  if (n !== void 0 && t.sa.has(n)) return;
  const s = (
    /**
    * Generate a new remote target ID for the given SDK target ID.
    * Re-map the given SDK to the new remote ID.
    * Delete any mapping of the old remote ID, if given.
    * @param remoteStoreImpl
    * @param sdkTargetId
    * @return The new remote ID.
    */
    (function(B, u) {
      const c = tB(B, u);
      c !== void 0 && // If there was an existing remote target ID mapped to that SDK target ID, forget about the old remote ID.
      B.oa.delete(c);
      const C = (function(m, R) {
        return R % 2 != 0 ? m.ua.next() : m.aa.next();
      })(B, u);
      return B._a.set(u, C), B.oa.set(C, u), C;
    })(t, e.targetId)
  );
  q(Vt, "remoteStoreListen mapping SDK target ID to remote", e.targetId, s);
  const i = new Jt(e.target, s, e.purpose, e.sequenceNumber, e.snapshotVersion, e.lastLimboFreeSnapshotVersion, e.resumeToken);
  t.sa.set(s, i), tu(t) ? (
    // The listen will be sent in onWatchStreamOpen
    eu(t)
  ) : qr(t).Jt() && ZB(t, i);
}
function XB(r, e) {
  const t = ne(r), n = qr(t), s = tB(t, e);
  q(Vt, "remoteStoreUnlisten removing mapping of SDK target ID to remote", e, s), t.sa.delete(s), t._a.delete(e), t.oa.delete(s), n.Jt() && zf(t, s), t.sa.size === 0 && (n.Jt() ? n.Xt() : or(t) && // Revert to OnlineState.Unknown if the watch stream is not open and we
  // have no listeners, since without any listens to send we cannot
  // confirm if the stream is healthy and upgrade to OnlineState.Online.
  t.ha.set(
    "Unknown"
    /* OnlineState.Unknown */
  ));
}
function ZB(r, e) {
  if (r.Ta.H(e.targetId), e.resumeToken.approximateByteSize() > 0 || e.snapshotVersion.compareTo(ee.min()) > 0) {
    const t = r.oa.get(e.targetId);
    if (t === void 0)
      return void q(Vt, "SDK target ID not found for remote ID: " + e.targetId);
    const n = r.remoteSyncer.getRemoteKeysForTarget(t).size;
    e = e.withExpectedCount(n);
  }
  qr(r).Tn(e);
}
function zf(r, e) {
  r.Ta.H(e), qr(r).Pn(e);
}
function eu(r) {
  r.Ta = new Z_({
    getRemoteKeysForTarget: (e) => {
      const t = r.oa.get(e);
      return t !== void 0 ? r.remoteSyncer.getRemoteKeysForTarget(t) : ie();
    },
    ge: (e) => r.sa.get(e) || null,
    Ae: () => r.datastore.serializer.databaseId
  }), qr(r).start(), r.ha.Xo();
}
function tu(r) {
  return or(r) && !qr(r).Ht() && r.sa.size > 0;
}
function or(r) {
  return ne(r).ca.size === 0;
}
function Qf(r) {
  r.Ta = void 0;
}
async function iy(r) {
  r.ha.set(
    "Online"
    /* OnlineState.Online */
  );
}
async function oy(r) {
  r.sa.forEach(((e, t) => {
    ZB(r, e);
  }));
}
async function ay(r, e) {
  Qf(r), // If we still need the watch stream, retry the connection.
  tu(r) ? (r.ha.na(e), eu(r)) : (
    // No need to restart watch stream because there are no active targets.
    // The online state is set to unknown because there is no active attempt
    // at establishing a connection
    r.ha.set(
      "Unknown"
      /* OnlineState.Unknown */
    )
  );
}
async function By(r, e, t) {
  if (
    // Mark the client as online since we got a message from the server
    r.ha.set(
      "Online"
      /* OnlineState.Online */
    ), e instanceof ZC && e.state === 2 && e.cause
  )
    try {
      await (async function(s, i) {
        const o = i.cause;
        for (const B of i.targetIds) {
          if (s.sa.has(B)) {
            const u = s.oa.get(B);
            u !== void 0 && (await s.remoteSyncer.rejectListen(u, o), s._a.delete(u), s.oa.delete(B)), s.sa.delete(B);
          }
          s.Ta.removeTarget(B);
        }
      })(r, e);
    } catch (n) {
      q(Vt, "Failed to remove targets %s: %s ", e.targetIds.join(","), n), await po(r, n);
    }
  else if (e instanceof Ki ? r.Ta.se(e) : e instanceof XC ? r.Ta.Ee(e) : r.Ta.ae(e), !t.isEqual(ee.min())) try {
    const n = await qf(r.localStore);
    t.compareTo(n) >= 0 && // We have received a target change with a global snapshot if the snapshot
    // version is not equal to SnapshotVersion.min().
    /**
    * Takes a batch of changes from the Datastore, repackages them as a
    * RemoteEvent, and passes that on to the listener, which is typically the
    * SyncEngine.
    */
    await (function(i, o) {
      const B = i.Ta.de(o);
      B.targetChanges.forEach(((c, C) => {
        if (c.resumeToken.approximateByteSize() > 0) {
          const f = i.sa.get(C);
          f && i.sa.set(C, f.withResumeToken(c.resumeToken, o));
        }
      })), // Re-establish listens for the targets that have been invalidated by
      // existence filter mismatches.
      // TODO ideally this would use a new remote target ID
      B.targetMismatches.forEach(((c, C) => {
        const f = i.sa.get(c);
        if (!f)
          return;
        i.sa.set(c, f.withResumeToken(Fe.EMPTY_BYTE_STRING, f.snapshotVersion)), // Cause a hard reset by unwatching and rewatching immediately, but
        // deliberately don't send a resume token so that we get a full update.
        zf(i, c);
        const m = new Jt(f.target, c, C, f.sequenceNumber);
        ZB(i, m);
      }));
      const u = (
        /**
        * Convert a RemoteEvent with remote IDs to a RemoteEvent with
        * SDK IDs and dropped updates
        * for any targets we no longer track.
        *
        * @param remoteStoreImpl
        * @param remoteEvent
        * @return a new RemoteEvent with SDK IDs and dropped updates
        * for any targets we no longer track.
        */
        (function(C, f) {
          const m = /* @__PURE__ */ new Map();
          f.targetChanges.forEach(((P, x) => {
            const H = C.oa.get(x);
            H !== void 0 && m.set(H, P);
          }));
          let R = new Ie(oe);
          return f.targetMismatches.forEach(((P, x) => {
            const H = C.oa.get(P);
            H !== void 0 && (R = R.insert(H, x));
          })), new ii(f.snapshotVersion, m, R, f.documentUpdates, f.augmentedDocumentUpdates, f.resolvedLimboDocuments);
        })(i, B)
      );
      return i.remoteSyncer.applyRemoteEvent(u);
    })(r, t);
  } catch (n) {
    q(Vt, "Failed to raise snapshot:", n), await po(r, n);
  }
}
async function po(r, e, t) {
  if (!Gr(e)) throw e;
  r.ca.add(
    1
    /* OfflineCause.IndexedDbFailed */
  ), // Disable network and raise offline snapshots
  await ci(r), r.ha.set(
    "Offline"
    /* OnlineState.Offline */
  ), t || // Use a simple read operation to determine if IndexedDB recovered.
  // Ideally, we would expose a health check directly on SimpleDb, but
  // RemoteStore only has access to persistence through LocalStore.
  (t = () => qf(r.localStore)), // Probe IndexedDB periodically and re-enable network
  r.asyncQueue.enqueueRetryable((async () => {
    q(Vt, "Retrying IndexedDB access"), await t(), r.ca.delete(
      1
      /* OfflineCause.IndexedDbFailed */
    ), await Ho(r);
  }));
}
function Wf(r, e) {
  return e().catch(((t) => po(r, t, e)));
}
async function Uo(r) {
  const e = ne(r), t = bn(e);
  let n = e.ia.length > 0 ? e.ia[e.ia.length - 1].batchId : _B;
  for (; uy(e); ) try {
    const s = await ey(e.localStore, n);
    if (s === null) {
      e.ia.length === 0 && t.Xt();
      break;
    }
    n = s.batchId, cy(e, s);
  } catch (s) {
    await po(e, s);
  }
  $f(e) && Yf(e);
}
function uy(r) {
  return or(r) && r.ia.length < 10;
}
function cy(r, e) {
  r.ia.push(e);
  const t = bn(r);
  t.Jt() && t.Rn && t.In(e.mutations);
}
function $f(r) {
  return or(r) && !bn(r).Ht() && r.ia.length > 0;
}
function Yf(r) {
  bn(r).start();
}
async function ly(r) {
  bn(r).dn();
}
async function hy(r) {
  const e = bn(r);
  for (const t of r.ia) e.In(t.mutations);
}
async function Cy(r, e, t) {
  const n = r.ia.shift(), s = zB.from(n, e, t);
  await Wf(r, (() => r.remoteSyncer.applySuccessfulWrite(s))), // It's possible that with the completion of this mutation another
  // slot has freed up.
  await Uo(r);
}
async function fy(r, e) {
  e && bn(r).Rn && // This error affects the actual write.
  await (async function(n, s) {
    if ((function(o) {
      return zC(o) && o !== L.ABORTED;
    })(s.code)) {
      const i = n.ia.shift();
      bn(n).Zt(), await Wf(n, (() => n.remoteSyncer.rejectFailedWrite(i.batchId, s))), // It's possible that with the completion of this mutation
      // another slot has freed up.
      await Uo(n);
    }
  })(r, e), // The write stream might have been started by refilling the write
  // pipeline for failed writes
  $f(r) && Yf(r);
}
async function Yl(r, e) {
  const t = ne(r);
  t.asyncQueue.verifyOperationInProgress(), q(Vt, "RemoteStore received new credentials");
  const n = or(t);
  t.ca.add(
    3
    /* OfflineCause.CredentialChange */
  ), await ci(t), n && // Don't set the network status to Unknown if we are offline.
  t.ha.set(
    "Unknown"
    /* OnlineState.Unknown */
  ), await t.remoteSyncer.handleCredentialChange(e), t.ca.delete(
    3
    /* OfflineCause.CredentialChange */
  ), await Ho(t);
}
async function dy(r, e) {
  const t = ne(r);
  e ? (t.ca.delete(
    2
    /* OfflineCause.IsSecondary */
  ), await Ho(t)) : e || (t.ca.add(
    2
    /* OfflineCause.IsSecondary */
  ), await ci(t), t.ha.set(
    "Unknown"
    /* OnlineState.Unknown */
  ));
}
function qr(r) {
  return r.Pa || // Create stream (but note that it is not started yet).
  (r.Pa = (function(t, n, s) {
    const i = ne(t);
    return i.mn(), new PD(n, i.connection, i.authCredentials, i.appCheckCredentials, i.serializer, s);
  })(r.datastore, r.asyncQueue, {
    ut: iy.bind(null, r),
    lt: oy.bind(null, r),
    ht: ay.bind(null, r),
    hn: By.bind(null, r)
  }), r.la.push((async (e) => {
    e ? (r.Pa.Zt(), tu(r) ? eu(r) : r.ha.set(
      "Unknown"
      /* OnlineState.Unknown */
    )) : (await r.Pa.stop(), Qf(r));
  }))), r.Pa;
}
function bn(r) {
  return r.Ra || // Create stream (but note that it is not started yet).
  (r.Ra = (function(t, n, s) {
    const i = ne(t);
    return i.mn(), new SD(n, i.connection, i.authCredentials, i.appCheckCredentials, i.serializer, s);
  })(r.datastore, r.asyncQueue, {
    ut: () => Promise.resolve(),
    lt: ly.bind(null, r),
    ht: fy.bind(null, r),
    An: hy.bind(null, r),
    Vn: Cy.bind(null, r)
  }), r.la.push((async (e) => {
    e ? (r.Ra.Zt(), // This will start the write stream if necessary.
    await Uo(r)) : (await r.Ra.stop(), r.ia.length > 0 && (q(Vt, `Stopping write stream with ${r.ia.length} pending writes`), r.ia = []));
  }))), r.Ra;
}
class py {
  constructor(e) {
    this.observer = e, /**
     * When set to true, will not raise future events. Necessary to deal with
     * async detachment of listener.
     */
    this.muted = !1;
  }
  next(e) {
    this.muted || this.observer.next && this.Ia(this.observer.next, e);
  }
  error(e) {
    this.muted || (this.observer.error ? this.Ia(this.observer.error, e) : Qt("Uncaught Error in snapshot listener:", e.toString()));
  }
  Aa() {
    this.muted = !0;
  }
  Ia(e, t) {
    setTimeout((() => {
      this.muted || e(t);
    }), 0);
  }
}
class nu {
  constructor(e, t, n, s, i) {
    this.asyncQueue = e, this.timerId = t, this.targetTimeMs = n, this.op = s, this.removalCallback = i, this.deferred = new En(), this.then = this.deferred.promise.then.bind(this.deferred.promise), // It's normal for the deferred promise to be canceled (due to cancellation)
    // and so we attach a dummy catch callback to avoid
    // 'UnhandledPromiseRejectionWarning' log spam.
    this.deferred.promise.catch(((o) => {
    }));
  }
  get promise() {
    return this.deferred.promise;
  }
  /**
   * Creates and returns a DelayedOperation that has been scheduled to be
   * executed on the provided asyncQueue after the provided delayMs.
   *
   * @param asyncQueue - The queue to schedule the operation on.
   * @param id - A Timer ID identifying the type of operation this is.
   * @param delayMs - The delay (ms) before the operation should be scheduled.
   * @param op - The operation to run.
   * @param removalCallback - A callback to be called synchronously once the
   *   operation is executed or canceled, notifying the AsyncQueue to remove it
   *   from its delayedOperations list.
   *   PORTING NOTE: This exists to prevent making removeDelayedOperation() and
   *   the DelayedOperation class public.
   */
  static createAndSchedule(e, t, n, s, i) {
    const o = Date.now() + n, B = new nu(e, t, o, s, i);
    return B.start(n), B;
  }
  /**
   * Starts the timer. This is called immediately after construction by
   * createAndSchedule().
   */
  start(e) {
    this.timerHandle = setTimeout((() => this.handleDelayElapsed()), e);
  }
  /**
   * Queues the operation to run immediately (if it hasn't already been run or
   * canceled).
   */
  skipDelay() {
    return this.handleDelayElapsed();
  }
  /**
   * Cancels the operation if it hasn't already been executed or canceled. The
   * promise will be rejected.
   *
   * As long as the operation has not yet been run, calling cancel() provides a
   * guarantee that the operation will not be run.
   */
  cancel(e) {
    this.timerHandle !== null && (this.clearTimeout(), this.deferred.reject(new j(L.CANCELLED, "Operation cancelled" + (e ? ": " + e : ""))));
  }
  handleDelayElapsed() {
    this.asyncQueue.enqueueAndForget((() => this.timerHandle !== null ? (this.clearTimeout(), this.op().then(((e) => this.deferred.resolve(e)))) : Promise.resolve()));
  }
  clearTimeout() {
    this.timerHandle !== null && (this.removalCallback(this), clearTimeout(this.timerHandle), this.timerHandle = null);
  }
}
function ru(r, e) {
  if (Qt("AsyncQueue", `${e}: ${r}`), Gr(r)) return new j(L.UNAVAILABLE, `${e}: ${r}`);
  throw r;
}
class Xl {
  constructor() {
    this.activeTargetIds = $_();
  }
  La(e) {
    this.activeTargetIds = this.activeTargetIds.add(e);
  }
  Ba(e) {
    this.activeTargetIds = this.activeTargetIds.delete(e);
  }
  /**
   * Converts this entry into a JSON-encoded format we can use for WebStorage.
   * Does not encode `clientId` as it is part of the key in WebStorage.
   */
  Na() {
    const e = {
      activeTargetIds: this.activeTargetIds.toArray(),
      updateTimeMs: Date.now()
    };
    return JSON.stringify(e);
  }
}
class gy {
  constructor() {
    this.du = new Xl(), this.fu = {}, this.onlineStateHandler = null, this.sequenceNumberHandler = null;
  }
  addPendingMutation(e) {
  }
  updateMutationState(e, t, n) {
  }
  addLocalQueryTarget(e, t = !0) {
    return t && this.du.La(e), this.fu[e] || "not-current";
  }
  updateQueryState(e, t, n) {
    this.fu[e] = t;
  }
  removeLocalQueryTarget(e) {
    this.du.Ba(e);
  }
  isLocalQueryTarget(e) {
    return this.du.activeTargetIds.has(e);
  }
  clearQueryState(e) {
    delete this.fu[e];
  }
  getAllActiveQueryTargets() {
    return this.du.activeTargetIds;
  }
  isActiveQueryTarget(e) {
    return this.du.activeTargetIds.has(e);
  }
  start() {
    return this.du = new Xl(), Promise.resolve();
  }
  handleUserChange(e, t, n) {
  }
  setOnlineState(e) {
  }
  shutdown() {
  }
  writeSequenceNumber(e) {
  }
  notifyBundleLoaded(e) {
  }
}
function va() {
  return typeof document < "u" ? document : null;
}
class $n {
  /**
   * Returns an empty copy of the existing DocumentSet, using the same
   * comparator.
   */
  static emptySet(e) {
    return new $n(e.comparator);
  }
  /** The default ordering is by key if the comparator is omitted */
  constructor(e) {
    this.comparator = e ? (t, n) => e(t, n) || Y.comparator(t.key, n.key) : (t, n) => Y.comparator(t.key, n.key), this.keyedMap = dr(), this.sortedSet = new Ie(this.comparator);
  }
  has(e) {
    return this.keyedMap.get(e) != null;
  }
  get(e) {
    return this.keyedMap.get(e);
  }
  first() {
    return this.sortedSet.minKey();
  }
  last() {
    return this.sortedSet.maxKey();
  }
  isEmpty() {
    return this.sortedSet.isEmpty();
  }
  /**
   * Returns the index of the provided key in the document set, or -1 if the
   * document key is not present in the set;
   */
  indexOf(e) {
    const t = this.keyedMap.get(e);
    return t ? this.sortedSet.indexOf(t) : -1;
  }
  get size() {
    return this.sortedSet.size;
  }
  /** Iterates documents in order defined by "comparator" */
  forEach(e) {
    this.sortedSet.inorderTraversal(((t, n) => (e(t), !1)));
  }
  /** Inserts or updates a document with the same key */
  add(e) {
    const t = this.delete(e.key);
    return t.copy(t.keyedMap.insert(e.key, e), t.sortedSet.insert(e, null));
  }
  /** Deletes a document with a given key */
  delete(e) {
    const t = this.get(e);
    return t ? this.copy(this.keyedMap.remove(e), this.sortedSet.remove(t)) : this;
  }
  isEqual(e) {
    if (!(e instanceof $n) || this.size !== e.size) return !1;
    const t = this.sortedSet.getIterator(), n = e.sortedSet.getIterator();
    for (; t.hasNext(); ) {
      const s = t.getNext().key, i = n.getNext().key;
      if (!s.isEqual(i)) return !1;
    }
    return !0;
  }
  toString() {
    const e = [];
    return this.forEach(((t) => {
      e.push(t.toString());
    })), e.length === 0 ? "DocumentSet ()" : `DocumentSet (
  ` + e.join(`  
`) + `
)`;
  }
  copy(e, t) {
    const n = new $n();
    return n.comparator = this.comparator, n.keyedMap = e, n.sortedSet = t, n;
  }
}
class Zl {
  constructor() {
    this.mu = new Ie(Y.comparator);
  }
  track(e) {
    const t = e.doc.key, n = this.mu.get(t);
    n ? (
      // Merge the new change with the existing change.
      e.type !== 0 && n.type === 3 ? this.mu = this.mu.insert(t, e) : e.type === 3 && n.type !== 1 ? this.mu = this.mu.insert(t, {
        type: n.type,
        doc: e.doc
      }) : e.type === 2 && n.type === 2 ? this.mu = this.mu.insert(t, {
        type: 2,
        doc: e.doc
      }) : e.type === 2 && n.type === 0 ? this.mu = this.mu.insert(t, {
        type: 0,
        doc: e.doc
      }) : e.type === 1 && n.type === 0 ? this.mu = this.mu.remove(t) : e.type === 1 && n.type === 2 ? this.mu = this.mu.insert(t, {
        type: 1,
        doc: n.doc
      }) : e.type === 0 && n.type === 1 ? this.mu = this.mu.insert(t, {
        type: 2,
        doc: e.doc
      }) : (
        // This includes these cases, which don't make sense:
        // Added->Added
        // Removed->Removed
        // Modified->Added
        // Removed->Modified
        // Metadata->Added
        // Removed->Metadata
        $(63341, {
          ye: e,
          pu: n
        })
      )
    ) : this.mu = this.mu.insert(t, e);
  }
  gu() {
    const e = [];
    return this.mu.inorderTraversal(((t, n) => {
      e.push(n);
    })), e;
  }
}
class Nr {
  constructor(e, t, n, s, i, o, B, u, c) {
    this.query = e, this.docs = t, this.oldDocs = n, this.docChanges = s, this.mutatedKeys = i, this.fromCache = o, this.syncStateChanged = B, this.excludesMetadataChanges = u, this.hasCachedResults = c;
  }
  /** Returns a view snapshot as if all documents in the snapshot were added. */
  static fromInitialDocuments(e, t, n, s, i) {
    const o = [];
    return t.forEach(((B) => {
      o.push({
        type: 0,
        doc: B
      });
    })), new Nr(
      e,
      t,
      $n.emptySet(t),
      o,
      n,
      s,
      /* syncStateChanged= */
      !0,
      /* excludesMetadataChanges= */
      !1,
      i
    );
  }
  get hasPendingWrites() {
    return !this.mutatedKeys.isEmpty();
  }
  isEqual(e) {
    if (!(this.fromCache === e.fromCache && this.hasCachedResults === e.hasCachedResults && this.syncStateChanged === e.syncStateChanged && this.mutatedKeys.isEqual(e.mutatedKeys) && Mo(this.query, e.query) && this.docs.isEqual(e.docs) && this.oldDocs.isEqual(e.oldDocs))) return !1;
    const t = this.docChanges, n = e.docChanges;
    if (t.length !== n.length) return !1;
    for (let s = 0; s < t.length; s++) if (t[s].type !== n[s].type || !t[s].doc.isEqual(n[s].doc)) return !1;
    return !0;
  }
}
class my {
  constructor() {
    this.yu = void 0, this.wu = [];
  }
  // Helper methods that checks if the query has listeners that listening to remote store
  bu() {
    return this.wu.some(((e) => e.Su()));
  }
}
class Ey {
  constructor() {
    this.queries = eh(), this.onlineState = "Unknown", this.vu = /* @__PURE__ */ new Set();
  }
  terminate() {
    (function(t, n) {
      const s = ne(t), i = s.queries;
      s.queries = eh(), i.forEach(((o, B) => {
        for (const u of B.wu) u.onError(n);
      }));
    })(this, new j(L.ABORTED, "Firestore shutting down"));
  }
}
function eh() {
  return new sr(((r) => xf(r)), Mo);
}
async function _y(r, e) {
  const t = ne(r);
  let n = 3;
  const s = e.query;
  let i = t.queries.get(s);
  i ? !i.bu() && e.Su() && // Query has been listening to local cache, and tries to add a new listener sourced from watch.
  (n = 2) : (i = new my(), n = e.Su() ? 0 : 1);
  try {
    switch (n) {
      case 0:
        i.yu = await t.onListen(
          s,
          /** enableRemoteListen= */
          !0
        );
        break;
      case 1:
        i.yu = await t.onListen(
          s,
          /** enableRemoteListen= */
          !1
        );
        break;
      case 2:
        await t.onFirstRemoteStoreListen(s);
    }
  } catch (o) {
    const B = ru(o, `Initialization of query '${Ve(e.query) ? qt(e.query) : Ds(e.query)}' failed`);
    return void e.onError(B);
  }
  t.queries.set(s, i), i.wu.push(e), // Run global snapshot listeners if a consistent snapshot has been emitted.
  e.Du(t.onlineState), i.yu && e.xu(i.yu) && su(t);
}
async function Dy(r, e) {
  const t = ne(r), n = e.query;
  let s = 3;
  const i = t.queries.get(n);
  if (i) {
    const o = i.wu.indexOf(e);
    o >= 0 && (i.wu.splice(o, 1), i.wu.length === 0 ? s = e.Su() ? 0 : 1 : !i.bu() && e.Su() && // The removed listener is the last one that sourced from watch.
    (s = 2));
  }
  switch (s) {
    case 0:
      return t.queries.delete(n), t.onUnlisten(
        n,
        /** disableRemoteListen= */
        !0
      );
    case 1:
      return t.queries.delete(n), t.onUnlisten(
        n,
        /** disableRemoteListen= */
        !1
      );
    case 2:
      return t.onLastRemoteStoreUnlisten(n);
    default:
      return;
  }
}
function Iy(r, e) {
  const t = ne(r);
  let n = !1;
  for (const s of e) {
    const i = s.query, o = t.queries.get(i);
    if (o) {
      for (const B of o.wu) B.xu(s) && (n = !0);
      o.yu = s;
    }
  }
  n && su(t);
}
function wy(r, e, t) {
  const n = ne(r), s = n.queries.get(e);
  if (s) for (const i of s.wu) i.onError(t);
  n.queries.delete(e);
}
function su(r) {
  r.vu.forEach(((e) => {
    e.next();
  }));
}
var nB;
(function(r) {
  r.Default = "default", /** Listen to changes in cache only */
  r.Cache = "cache";
})(nB || (nB = {}));
class yy {
  constructor(e, t, n) {
    this.query = e, this.Cu = t, /**
     * Initial snapshots (e.g. from cache) may not be propagated to the wrapped
     * observer. This flag is set to true once we've actually raised an event.
     */
    this.Fu = !1, this.Ou = null, this.onlineState = "Unknown", this.options = n || {};
  }
  /**
   * Applies the new ViewSnapshot to this listener, raising a user-facing event
   * if applicable (depending on what changed, whether the user has opted into
   * metadata-only changes, etc.). Returns true if a user-facing event was
   * indeed raised.
   */
  xu(e) {
    if (!this.options.includeMetadataChanges) {
      const n = [];
      for (const s of e.docChanges) s.type !== 3 && n.push(s);
      e = new Nr(
        e.query,
        e.docs,
        e.oldDocs,
        n,
        e.mutatedKeys,
        e.fromCache,
        e.syncStateChanged,
        /* excludesMetadataChanges= */
        !0,
        e.hasCachedResults
      );
    }
    let t = !1;
    return this.Fu ? this.Mu(e) && (this.Cu.next(e), t = !0) : this.Nu(e, this.onlineState) && (this.Lu(e), t = !0), this.Ou = e, t;
  }
  onError(e) {
    this.Cu.error(e);
  }
  /** Returns whether a snapshot was raised. */
  Du(e) {
    this.onlineState = e;
    let t = !1;
    return this.Ou && !this.Fu && this.Nu(this.Ou, e) && (this.Lu(this.Ou), t = !0), t;
  }
  Nu(e, t) {
    if (!e.fromCache || !this.Su()) return !0;
    const n = t !== "Offline";
    return (!this.options.waitForSyncWhenOnline || !n) && (!e.docs.isEmpty() || e.hasCachedResults || t === "Offline");
  }
  Mu(e) {
    if (e.docChanges.length > 0) return !0;
    const t = this.Ou && this.Ou.hasPendingWrites !== e.hasPendingWrites;
    return !(!e.syncStateChanged && !t) && this.options.includeMetadataChanges === !0;
  }
  Lu(e) {
    e = Nr.fromInitialDocuments(e.query, e.docs, e.mutatedKeys, e.fromCache, e.hasCachedResults), this.Fu = !0, this.Cu.next(e);
  }
  Su() {
    return this.options.source !== nB.Cache;
  }
}
class Xf {
  constructor(e) {
    this.key = e;
  }
}
class Zf {
  constructor(e) {
    this.key = e;
  }
}
class Ty {
  constructor(e, t) {
    this.query = e, this.Gu = t, this.zu = null, this.hasCachedResults = !1, /**
     * A flag whether the view is current with the backend. A view is considered
     * current after it has seen the current flag from the backend and did not
     * lose consistency within the watch stream (e.g. because of an existence
     * filter mismatch).
     */
    this.current = !1, /** Documents in the view but not in the remote target */
    this.ju = ie(), /** Document Keys that have local changes */
    this.mutatedKeys = ie(), this.Hu = Ve(e) ? Za(e) : AB(e), this.Ju = new $n(this.Hu);
  }
  /**
   * The set of remote documents that the server has told us belongs to the target associated with
   * this view.
   */
  get Yu() {
    return this.Gu;
  }
  /**
   * Iterates over a set of doc changes, applies the query limit, and computes
   * what the new results should be, what the changes were, and whether we may
   * need to go back to the local cache for more results. Does not make any
   * changes to the view.
   * @param docChanges - The doc changes to apply to this view.
   * @param previousChanges - If this is being called with a refill, then start
   *        with this set of docs and changes instead of the current view.
   * @returns a new set of docs, changes, and refill flag.
   */
  Zu(e, t) {
    const n = t ? t.Xu : new Zl(), s = t ? t.Ju : this.Ju;
    let i = t ? t.mutatedKeys : this.mutatedKeys, o = s, B = !1;
    const [u, c] = this.ec(this.query, s);
    e.inorderTraversal(((f, m) => {
      const R = s.get(f), P = bw(this.query, m) ? m : null, x = !!R && this.mutatedKeys.has(R.key), H = !!P && (P.hasLocalMutations || // We only consider committed mutations for documents that were
      // mutated during the lifetime of the view.
      this.mutatedKeys.has(P.key) && P.hasCommittedMutations);
      let z = !1;
      R && P ? R.data.isEqual(P.data) ? x !== H && (n.track({
        type: 3,
        doc: P
      }), z = !0) : this.tc(R, P) || (n.track({
        type: 2,
        doc: P
      }), z = !0, (u && this.Hu(P, u) > 0 || c && this.Hu(P, c) < 0) && // This doc moved from inside the limit to outside the limit.
      // That means there may be some other doc in the local cache
      // that should be included instead.
      (B = !0)) : !R && P ? (n.track({
        type: 0,
        doc: P
      }), z = !0) : R && !P && (n.track({
        type: 1,
        doc: R
      }), z = !0, (u || c) && // A doc was removed from a full limit query. We'll need to
      // requery from the local cache to see if we know about some other
      // doc that should be in the results.
      (B = !0)), z && (P ? (o = o.add(P), i = H ? i.add(f) : i.delete(f)) : (o = o.delete(f), i = i.delete(f)));
    }));
    const C = this.nc(this.query);
    if (C) if (Ve(this.query)) {
      const f = [];
      o.forEach(((P) => f.push(P)));
      const m = Uf(this.query, f);
      let R = new $n(Za(this.query));
      for (const P of m) R = R.add(P);
      o.forEach(((P) => {
        R.has(P.key) || (i = i.delete(P.key), n.track({
          type: 1,
          doc: P
        }));
      })), o = R;
    } else {
      const f = this.rc(this.query);
      for (; o.size > C; ) {
        const m = f === "F" ? o.last() : o.first();
        o = o.delete(m.key), i = i.delete(m.key), n.track({
          type: 1,
          doc: m
        });
      }
    }
    return {
      Ju: o,
      Xu: n,
      Fo: B,
      mutatedKeys: i
    };
  }
  nc(e) {
    return Ve(e) ? Ra(e)?.limit : e.limit || void 0;
  }
  rc(e) {
    if (Ve(e)) {
      const t = Ra(e);
      return t && t.limit < 0 ? "L" : "F";
    }
    return e.limitType;
  }
  ec(e, t) {
    if (Ve(e)) {
      const n = Ra(e)?.limit;
      return [t.size === n ? t.last() : null, null];
    }
    return [e.limitType === "F" && t.size === this.nc(this.query) ? t.last() : null, e.limitType === "L" && t.size === this.nc(this.query) ? t.first() : null];
  }
  tc(e, t) {
    return e.hasLocalMutations && t.hasCommittedMutations && !t.hasLocalMutations;
  }
  /**
   * Updates the view with the given ViewDocumentChanges and optionally updates
   * limbo docs and sync state from the provided target change.
   * @param docChanges - The set of changes to make to the view's docs.
   * @param limboResolutionEnabled - Whether to update limbo documents based on
   *        this change.
   * @param targetChange - A target change to apply for computing limbo docs and
   *        sync state.
   * @param targetIsPendingReset - Whether the target is pending to reset due to
   *        existence filter mismatch. If not explicitly specified, it is treated
   *        equivalently to `false`.
   * @returns A new ViewChange with the given docs, changes, and sync state.
   */
  // PORTING NOTE: The iOS/Android clients always compute limbo document changes.
  applyChanges(e, t, n, s) {
    const i = this.Ju;
    this.Ju = e.Ju, this.mutatedKeys = e.mutatedKeys;
    const o = e.Xu.gu();
    o.sort(((C, f) => (function(R, P) {
      const x = (H) => {
        switch (H) {
          case 0:
            return 1;
          case 2:
          case 3:
            return 2;
          case 1:
            return 0;
          default:
            return $(20277, {
              ye: H
            });
        }
      };
      return x(R) - x(P);
    })(C.type, f.type) || this.Hu(C.doc, f.doc))), this.sc(n), s = s ?? !1;
    const B = t && !s ? this._c() : [], u = this.ju.size === 0 && this.current && !s ? 1 : 0, c = u !== this.zu;
    return this.zu = u, o.length !== 0 || c ? {
      snapshot: new Nr(
        this.query,
        e.Ju,
        i,
        o,
        e.mutatedKeys,
        u === 0,
        c,
        /* excludesMetadataChanges= */
        !1,
        !!n && n.resumeToken.approximateByteSize() > 0
      ),
      oc: B
    } : {
      oc: B
    };
  }
  /**
   * Applies an OnlineState change to the view, potentially generating a
   * ViewChange if the view's syncState changes as a result.
   */
  Du(e) {
    return this.current && e === "Offline" ? (
      // If we're offline, set `current` to false and then call applyChanges()
      // to refresh our syncState and generate a ViewChange as appropriate. We
      // are guaranteed to get a new TargetChange that sets `current` back to
      // true once the client is back online.
      (this.current = !1, this.applyChanges(
        {
          Ju: this.Ju,
          Xu: new Zl(),
          mutatedKeys: this.mutatedKeys,
          Fo: !1
        },
        /* limboResolutionEnabled= */
        !1
      ))
    ) : {
      oc: []
    };
  }
  /**
   * Returns whether the doc for the given key should be in limbo.
   */
  ac(e) {
    return !this.Gu.has(e) && // The local store doesn't think it's a result, so it shouldn't be in limbo.
    !!this.Ju.has(e) && !this.Ju.get(e).hasLocalMutations;
  }
  /**
   * Updates syncedDocuments, current, and limbo docs based on the given change.
   * Returns the list of changes to which docs are in limbo.
   */
  sc(e) {
    e && (e.addedDocuments.forEach(((t) => this.Gu = this.Gu.add(t))), e.modifiedDocuments.forEach(((t) => {
    })), e.removedDocuments.forEach(((t) => this.Gu = this.Gu.delete(t))), this.current = e.current);
  }
  _c() {
    if (!this.current) return [];
    const e = this.ju;
    this.ju = ie(), this.Ju.forEach(((n) => {
      this.ac(n.key) && (this.ju = this.ju.add(n.key));
    }));
    const t = [];
    return e.forEach(((n) => {
      this.ju.has(n) || t.push(new Zf(n));
    })), this.ju.forEach(((n) => {
      e.has(n) || t.push(new Xf(n));
    })), t;
  }
  /**
   * Update the in-memory state of the current view with the state read from
   * persistence.
   *
   * We update the query view whenever a client's primary status changes:
   * - When a client transitions from primary to secondary, it can miss
   *   LocalStorage updates and its query views may temporarily not be
   *   synchronized with the state on disk.
   * - For secondary to primary transitions, the client needs to update the list
   *   of `syncedDocuments` since secondary clients update their query views
   *   based purely on synthesized RemoteEvents.
   *
   * @param queryResult.documents - The documents that match the query according
   * to the LocalStore.
   * @param queryResult.remoteKeys - The keys of the documents that match the
   * query according to the backend.
   *
   * @returns The ViewChange that resulted from this synchronization.
   */
  // PORTING NOTE: Multi-tab only.
  uc(e) {
    this.Gu = e.Qo, this.ju = ie();
    const t = this.Zu(e.documents);
    return this.applyChanges(
      t,
      /* limboResolutionEnabled= */
      !0
    );
  }
  /**
   * Returns a view snapshot as if this query was just listened to. Contains
   * a document add for every existing document and the `fromCache` and
   * `hasPendingWrites` status of the already established view.
   */
  // PORTING NOTE: Multi-tab only.
  cc() {
    return Nr.fromInitialDocuments(this.query, this.Ju, this.mutatedKeys, this.zu === 0, this.hasCachedResults);
  }
}
const iu = "SyncEngine";
class Ay {
  constructor(e, t, n) {
    this.query = e, this.targetId = t, this.view = n;
  }
}
class Ry {
  constructor(e) {
    this.key = e, /**
     * Set to true once we've received a document. This is used in
     * getRemoteKeysForTarget() and ultimately used by WatchChangeAggregator to
     * decide whether it needs to manufacture a delete event for the target once
     * the target is CURRENT.
     */
    this.lc = !1;
  }
}
class vy {
  constructor(e, t, n, s, i, o) {
    this.localStore = e, this.remoteStore = t, this.eventManager = n, this.sharedClientState = s, this.currentUser = i, this.maxConcurrentLimboResolutions = o, this.Ec = {}, this.hc = new sr(((B) => xf(B)), Mo), this.Tc = /* @__PURE__ */ new Map(), /**
     * The keys of documents that are in limbo for which we haven't yet started a
     * limbo resolution query. The strings in this set are the result of calling
     * `key.path.canonicalString()` where `key` is a `DocumentKey` object.
     *
     * The `Set` type was chosen because it provides efficient lookup and removal
     * of arbitrary elements and it also maintains insertion order, providing the
     * desired queue-like FIFO semantics.
     */
    this.Pc = /* @__PURE__ */ new Set(), /**
     * Keeps track of the target ID for each document that is in limbo with an
     * active target.
     */
    this.Rc = new Ie(Y.comparator), /**
     * Keeps track of the information about an active limbo resolution for each
     * active target ID that was started for the purpose of limbo resolution.
     */
    this.Ic = /* @__PURE__ */ new Map(), this.Ac = new QB(), /** Stores user completion handlers, indexed by User and BatchId. */
    this.Vc = {}, /** Stores user callbacks waiting for all pending writes to be acknowledged. */
    this.dc = /* @__PURE__ */ new Map(), this.fc = On.ws(), this.onlineState = "Unknown", // The primary state is set to `true` or `false` immediately after Firestore
    // startup. In the interim, a client should only be considered primary if
    // `isPrimary` is true.
    this.mc = void 0;
  }
  get isPrimaryClient() {
    return this.mc === !0;
  }
}
async function Py(r, e, t = !0) {
  const n = id(r);
  let s;
  const i = n.hc.get(e);
  return i ? (
    // PORTING NOTE: With Multi-Tab Web, it is possible that a query view
    // already exists when EventManager calls us for the first time. This
    // happens when the primary tab is already listening to this query on
    // behalf of another tab and the user of the primary also starts listening
    // to the query. EventManager will not have an assigned target ID in this
    // case and calls `listen` to obtain this ID.
    (n.sharedClientState.addLocalQueryTarget(i.targetId), s = i.view.cc())
  ) : s = await ed(
    n,
    e,
    t,
    /** shouldInitializeView= */
    !0
  ), s;
}
async function Sy(r, e) {
  const t = id(r);
  await ed(
    t,
    e,
    /** shouldListenToRemote= */
    !0,
    /** shouldInitializeView= */
    !1
  );
}
async function ed(r, e, t, n) {
  const s = await ty(r.localStore, Ve(e) ? e : Ft(e)), i = s.targetId, o = r.sharedClientState.addLocalQueryTarget(i, t);
  let B;
  return n && (B = await Oy(r, e, i, o === "current", s.resumeToken)), r.isPrimaryClient && t && Kf(r.remoteStore, s), B;
}
async function Oy(r, e, t, n, s) {
  r.gc = (f, m, R) => (async function(x, H, z, se) {
    let De = H.view.Zu(z);
    De.Fo && // The query has a limit and some docs were removed, so we need
    // to re-run the query against the local store to make sure we
    // didn't lose any good docs that had been past the limit.
    (De = await $l(
      x.localStore,
      H.query,
      /* usePreviousResults= */
      !1
    ).then((({ documents: T }) => H.view.Zu(T, De))));
    const ve = se && se.targetChanges.get(H.targetId), ct = se && se.targetMismatches.get(H.targetId) != null, we = H.view.applyChanges(
      De,
      /* limboResolutionEnabled= */
      x.isPrimaryClient,
      ve,
      ct
    );
    return nh(x, H.targetId, we.oc), we.snapshot;
  })(r, f, m, R);
  const i = await $l(
    r.localStore,
    e,
    /* usePreviousResults= */
    !0
  ), o = new Ty(e, i.Qo), B = o.Zu(i.documents), u = oi.createSynthesizedTargetChangeForCurrentChange(t, n && r.onlineState !== "Offline", s), c = o.applyChanges(
    B,
    /* limboResolutionEnabled= */
    r.isPrimaryClient,
    u
  );
  nh(r, t, c.oc);
  const C = new Ay(e, t, o);
  return r.hc.set(e, C), r.Tc.has(t) ? r.Tc.get(t).push(e) : r.Tc.set(t, [e]), c.snapshot;
}
async function by(r, e, t) {
  const n = ne(r), s = n.hc.get(e), i = n.Tc.get(s.targetId);
  if (i.length > 1) return n.Tc.set(s.targetId, i.filter(((o) => !Mo(o, e)))), void n.hc.delete(e);
  n.isPrimaryClient ? (n.sharedClientState.removeLocalQueryTarget(s.targetId), n.sharedClientState.isActiveQueryTarget(s.targetId) || await eB(
    n.localStore,
    s.targetId,
    /*keepPersistedTargetData=*/
    !1
  ).then((() => {
    n.sharedClientState.clearQueryState(s.targetId), t && XB(n.remoteStore, s.targetId), rB(n, s.targetId);
  })).catch(Mr)) : (rB(n, s.targetId), await eB(
    n.localStore,
    s.targetId,
    /*keepPersistedTargetData=*/
    !0
  ));
}
async function Ny(r, e) {
  const t = ne(r), n = t.hc.get(e), s = t.Tc.get(n.targetId);
  t.isPrimaryClient && s.length === 1 && // PORTING NOTE: Unregister the target ID with local Firestore client as
  // watch target.
  (t.sharedClientState.removeLocalQueryTarget(n.targetId), XB(t.remoteStore, n.targetId));
}
async function Fy(r, e, t) {
  const n = Hy(r);
  try {
    const s = await (function(o, B) {
      const u = ne(o), c = _e.now(), C = B.reduce(((R, P) => R.add(P.key)), ie());
      let f, m;
      return u.persistence.runTransaction("Locally write mutations", "readwrite", ((R) => {
        let P = it(), x = ie();
        return u.Uo.getEntries(R, C).next(((H) => {
          P = H, P.forEach(((z, se) => {
            se.isValidDocument() || (x = x.add(z));
          }));
        })).next((() => u.localDocuments.getOverlayedDocuments(R, P))).next(((H) => {
          f = H;
          const z = [];
          for (const se of B) {
            const De = A_(se, f.get(se.key).overlayedDocument);
            De != null && // NOTE: The base state should only be applied if there's some
            // existing document to override, so use a Precondition of
            // exists=true
            z.push(new kn(se.key, De, PC(De.value.mapValue), Xe.exists(!0)));
          }
          return u.mutationQueue.addMutationBatch(R, c, z, B);
        })).next(((H) => {
          m = H;
          const z = H.applyToLocalDocumentSet(f, x);
          return u.documentOverlayCache.saveOverlays(R, H.batchId, z);
        }));
      })).then((() => ({
        batchId: m.batchId,
        changes: $C(f)
      })));
    })(n.localStore, e);
    n.sharedClientState.addPendingMutation(s.batchId), (function(o, B, u) {
      let c = o.Vc[o.currentUser.toKey()];
      c || (c = new Ie(oe)), c = c.insert(B, u), o.Vc[o.currentUser.toKey()] = c;
    })(n, s.batchId, t), await li(n, s.changes), await Uo(n.remoteStore);
  } catch (s) {
    const i = ru(s, "Failed to persist write");
    t.reject(i);
  }
}
async function td(r, e) {
  const t = ne(r);
  try {
    const n = await Xw(t.localStore, e);
    e.targetChanges.forEach(((s, i) => {
      const o = t.Ic.get(i);
      o && // Since this is a limbo resolution lookup, it's for a single document
      // and it could be added, modified, or removed, but not a combination.
      (Q(s.addedDocuments.size + s.modifiedDocuments.size + s.removedDocuments.size <= 1, 22616), s.addedDocuments.size > 0 ? o.lc = !0 : s.modifiedDocuments.size > 0 ? Q(o.lc, 14607) : s.removedDocuments.size > 0 && (Q(o.lc, 42227), o.lc = !1));
    })), await li(t, n, e);
  } catch (n) {
    await Mr(n);
  }
}
function th(r, e, t) {
  const n = ne(r);
  if (n.isPrimaryClient && t === 0 || !n.isPrimaryClient && t === 1) {
    const s = [];
    n.hc.forEach(((i, o) => {
      const B = o.view.Du(e);
      B.snapshot && s.push(B.snapshot);
    })), (function(o, B) {
      const u = ne(o);
      u.onlineState = B;
      let c = !1;
      u.queries.forEach(((C, f) => {
        for (const m of f.wu)
          m.Du(B) && (c = !0);
      })), c && su(u);
    })(n.eventManager, e), s.length && n.Ec.hn(s), n.onlineState = e, n.isPrimaryClient && n.sharedClientState.setOnlineState(e);
  }
}
async function Ly(r, e, t) {
  const n = ne(r);
  n.sharedClientState.updateQueryState(e, "rejected", t);
  const s = n.Ic.get(e), i = s && s.key;
  if (i) {
    let o = new Ie(Y.comparator);
    o = o.insert(i, Ge.newNoDocument(i, ee.min()));
    const B = ie().add(i), u = new ii(
      ee.min(),
      /* targetChanges= */
      /* @__PURE__ */ new Map(),
      /* targetMismatches= */
      new Ie(oe),
      o,
      it(),
      B
    );
    await td(n, u), // Since this query failed, we won't want to manually unlisten to it.
    // We only remove it from bookkeeping after we successfully applied the
    // RemoteEvent. If `applyRemoteEvent()` throws, we want to re-listen to
    // this query when the RemoteStore restarts the Watch stream, which should
    // re-trigger the target failure.
    n.Rc = n.Rc.remove(i), n.Ic.delete(e), ou(n);
  } else await eB(
    n.localStore,
    e,
    /* keepPersistedTargetData */
    !1
  ).then((() => rB(n, e, t))).catch(Mr);
}
async function ky(r, e) {
  const t = ne(r), n = e.batch.batchId;
  try {
    const s = await Yw(t.localStore, e);
    rd(
      t,
      n,
      /*error=*/
      null
    ), nd(t, n), t.sharedClientState.updateMutationState(n, "acknowledged"), await li(t, s);
  } catch (s) {
    await Mr(s);
  }
}
async function Vy(r, e, t) {
  const n = ne(r);
  try {
    const s = await (function(o, B) {
      const u = ne(o);
      return u.persistence.runTransaction("Reject batch", "readwrite-primary", ((c) => {
        let C;
        return u.mutationQueue.lookupMutationBatch(c, B).next(((f) => (Q(f !== null, 37113), C = f.keys(), u.mutationQueue.removeMutationBatch(c, f)))).next((() => u.mutationQueue.performConsistencyCheck(c))).next((() => u.documentOverlayCache.removeOverlaysForBatchId(c, C, B))).next((() => u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(c, C))).next((() => u.localDocuments.getDocuments(c, C)));
      }));
    })(n.localStore, e);
    rd(n, e, t), nd(n, e), n.sharedClientState.updateMutationState(e, "rejected", t), await li(n, s);
  } catch (s) {
    await Mr(s);
  }
}
function nd(r, e) {
  (r.dc.get(e) || []).forEach(((t) => {
    t.resolve();
  })), r.dc.delete(e);
}
function rd(r, e, t) {
  const n = ne(r);
  let s = n.Vc[n.currentUser.toKey()];
  if (s) {
    const i = s.get(e);
    i && (t ? i.reject(t) : i.resolve(), s = s.remove(e)), n.Vc[n.currentUser.toKey()] = s;
  }
}
function rB(r, e, t = null) {
  r.sharedClientState.removeLocalQueryTarget(e);
  for (const n of r.Tc.get(e)) r.hc.delete(n), t && r.Ec.yc(n, t);
  r.Tc.delete(e), r.isPrimaryClient && r.Ac.Xs(e).forEach(((n) => {
    r.Ac.containsKey(n) || // We removed the last reference for this key
    sd(r, n);
  }));
}
function sd(r, e) {
  r.Pc.delete(e.path.canonicalString());
  const t = r.Rc.get(e);
  t !== null && (XB(r.remoteStore, t), r.Rc = r.Rc.remove(e), r.Ic.delete(t), ou(r));
}
function nh(r, e, t) {
  for (const n of t) n instanceof Xf ? (r.Ac.addReference(n.key, e), xy(r, n)) : n instanceof Zf ? (q(iu, "Document no longer in limbo: " + n.key), r.Ac.removeReference(n.key, e), r.Ac.containsKey(n.key) || // We removed the last reference for this key
  sd(r, n.key)) : $(19791, {
    wc: n
  });
}
function xy(r, e) {
  const t = e.key, n = t.path.canonicalString();
  r.Rc.get(t) || r.Pc.has(n) || (q(iu, "New document in limbo: " + t), r.Pc.add(n), ou(r));
}
function ou(r) {
  for (; r.Pc.size > 0 && r.Rc.size < r.maxConcurrentLimboResolutions; ) {
    const e = r.Pc.values().next().value;
    r.Pc.delete(e);
    const t = new Y(he.fromString(e)), n = r.fc.next();
    r.Ic.set(n, new Ry(t)), r.Rc = r.Rc.insert(t, n), Kf(r.remoteStore, new Jt(Ft(TB(t.path)), n, "TargetPurposeLimboResolution", Oo.yn));
  }
}
async function li(r, e, t) {
  const n = ne(r), s = [], i = [], o = [];
  n.hc.isEmpty() || (n.hc.forEach(((B, u) => {
    o.push(n.gc(u, e, t).then(((c) => {
      if ((c || t) && n.isPrimaryClient) {
        const C = c ? !c.fromCache : t?.targetChanges.get(u.targetId)?.current;
        n.sharedClientState.updateQueryState(u.targetId, C ? "current" : "not-current");
      }
      if (c) {
        s.push(c);
        const C = $B.fo(u.targetId, c);
        i.push(C);
      }
    })));
  })), await Promise.all(o), n.Ec.hn(s), await (async function(u, c) {
    const C = ne(u);
    try {
      await C.persistence.runTransaction("notifyLocalViewChanges", "readwrite", ((f) => k.forEach(c, ((m) => k.forEach(m.Ao, ((R) => C.persistence.referenceDelegate.addReference(f, m.targetId, R))).next((() => k.forEach(m.Vo, ((R) => C.persistence.referenceDelegate.removeReference(f, m.targetId, R)))))))));
    } catch (f) {
      if (!Gr(f)) throw f;
      q(YB, "Failed to update sequence numbers: " + f);
    }
    for (const f of c) {
      const m = f.targetId;
      if (!f.fromCache) {
        const R = C.No.get(m), P = R.snapshotVersion, x = R.withLastLimboFreeSnapshotVersion(P);
        C.No = C.No.insert(m, x);
      }
    }
  })(n.localStore, i));
}
async function My(r, e) {
  const t = ne(r);
  if (!t.currentUser.isEqual(e)) {
    q(iu, "User change. New user:", e.toKey());
    const n = await jf(t.localStore, e);
    t.currentUser = e, // Fails tasks waiting for pending writes requested by previous user.
    (function(i, o) {
      i.dc.forEach(((B) => {
        B.forEach(((u) => {
          u.reject(new j(L.CANCELLED, o));
        }));
      })), i.dc.clear();
    })(t, "'waitForPendingWrites' promise is rejected due to a user change."), // TODO(b/114226417): Consider calling this only in the primary tab.
    t.sharedClientState.handleUserChange(e, n.removedBatchIds, n.addedBatchIds), await li(t, n.qo);
  }
}
function Gy(r, e) {
  const t = ne(r), n = t.Ic.get(e);
  if (n && n.lc) return ie().add(n.key);
  {
    let s = ie();
    const i = t.Tc.get(e);
    if (!i) return s;
    for (const o of i ?? []) {
      const B = t.hc.get(o);
      s = s.unionWith(B.view.Yu);
    }
    return s;
  }
}
function id(r) {
  const e = ne(r);
  return e.remoteStore.remoteSyncer.applyRemoteEvent = td.bind(null, e), e.remoteStore.remoteSyncer.getRemoteKeysForTarget = Gy.bind(null, e), e.remoteStore.remoteSyncer.rejectListen = Ly.bind(null, e), e.Ec.hn = Iy.bind(null, e.eventManager), e.Ec.yc = wy.bind(null, e.eventManager), e;
}
function Hy(r) {
  const e = ne(r);
  return e.remoteStore.remoteSyncer.applySuccessfulWrite = ky.bind(null, e), e.remoteStore.remoteSyncer.rejectFailedWrite = Vy.bind(null, e), e;
}
class go {
  constructor() {
    this.kind = "memory", this.synchronizeTabs = !1;
  }
  async initialize(e) {
    this.serializer = So(e.databaseInfo.databaseId), this.sharedClientState = this.Sc(e), this.persistence = this.vc(e), await this.persistence.start(), this.localStore = this.Dc(e), this.gcScheduler = this.xc(e, this.localStore), this.indexBackfillerScheduler = this.Cc(e, this.localStore);
  }
  xc(e, t) {
    return null;
  }
  Cc(e, t) {
    return null;
  }
  Dc(e) {
    return $w(this.persistence, new zw(), e.initialUser, this.serializer);
  }
  vc(e) {
    return new Jf(WB.w_, this.serializer);
  }
  Sc(e) {
    return new gy();
  }
  async terminate() {
    this.gcScheduler?.stop(), this.indexBackfillerScheduler?.stop(), this.sharedClientState.shutdown(), await this.persistence.shutdown();
  }
}
go.provider = {
  build: () => new go()
};
class Uy extends go {
  constructor(e) {
    super(), this.cacheSizeBytes = e;
  }
  xc(e, t) {
    Q(this.persistence.referenceDelegate instanceof fo, 46915);
    const n = this.persistence.referenceDelegate.garbageCollector;
    return new HD(n, e.asyncQueue, t);
  }
  vc(e) {
    const t = this.cacheSizeBytes !== void 0 ? rt.withCacheSize(this.cacheSizeBytes) : rt.DEFAULT;
    return new Jf(((n) => fo.w_(n, t)), this.serializer);
  }
}
class sB {
  async initialize(e, t) {
    this.localStore || (this.localStore = e.localStore, this.sharedClientState = e.sharedClientState, this.datastore = this.createDatastore(t), this.remoteStore = this.createRemoteStore(t), this.eventManager = this.createEventManager(t), this.syncEngine = this.createSyncEngine(
      t,
      /* startAsPrimary=*/
      !e.synchronizeTabs
    ), this.sharedClientState.onlineStateHandler = (n) => th(
      this.syncEngine,
      n,
      1
      /* OnlineStateSource.SharedClientState */
    ), this.remoteStore.remoteSyncer.handleCredentialChange = My.bind(null, this.syncEngine), await dy(this.remoteStore, this.syncEngine.isPrimaryClient));
  }
  createEventManager(e) {
    return (function() {
      return new Ey();
    })();
  }
  createDatastore(e) {
    const t = So(e.databaseInfo.databaseId), n = vD(e.databaseInfo);
    return ND(e.authCredentials, e.appCheckCredentials, n, t);
  }
  createRemoteStore(e) {
    return (function(n, s, i, o, B) {
      return new sy(n, s, i, o, B);
    })(this.localStore, this.datastore, e.asyncQueue, ((t) => th(
      this.syncEngine,
      t,
      0
      /* OnlineStateSource.RemoteStore */
    )), (function() {
      return Ml.Je() ? new Ml() : new yD();
    })());
  }
  createSyncEngine(e, t) {
    return (function(s, i, o, B, u, c, C) {
      const f = new vy(s, i, o, B, u, c);
      return C && (f.mc = !0), f;
    })(this.localStore, this.remoteStore, this.eventManager, this.sharedClientState, e.initialUser, e.maxConcurrentLimboResolutions, t);
  }
  async terminate() {
    await (async function(t) {
      const n = ne(t);
      q(Vt, "RemoteStore shutting down."), n.ca.add(
        5
        /* OfflineCause.Shutdown */
      ), await ci(n), n.Ea.shutdown(), // Set the OnlineState to Unknown (rather than Offline) to avoid potentially
      // triggering spurious listener events with cached data, etc.
      n.ha.set(
        "Unknown"
        /* OnlineState.Unknown */
      );
    })(this.remoteStore), this.datastore?.terminate(), this.eventManager?.terminate();
  }
}
sB.provider = {
  build: () => new sB()
};
let Jy = class {
  constructor(e) {
    this.datastore = e, // The version of each document that was read during this transaction.
    this.readVersions = /* @__PURE__ */ new Map(), this.mutations = [], this.committed = !1, /**
     * A deferred usage error that occurred previously in this transaction that
     * will cause the transaction to fail once it actually commits.
     */
    this.lastTransactionError = null, /**
     * Set of documents that have been written in the transaction.
     *
     * When there's more than one write to the same key in a transaction, any
     * writes after the first are handled differently.
     */
    this.writtenDocs = /* @__PURE__ */ new Set();
  }
  async lookup(e) {
    if (this.ensureCommitNotCalled(), this.mutations.length > 0) throw this.lastTransactionError = new j(L.INVALID_ARGUMENT, "Firestore transactions require all reads to be executed before all writes."), this.lastTransactionError;
    const t = await (async function(s, i) {
      const o = ne(s), B = {
        documents: i.map(((f) => xs(o.serializer, f)))
      }, u = await o.st("BatchGetDocuments", o.serializer.databaseId, he.emptyPath(), B, i.length), c = /* @__PURE__ */ new Map();
      u.forEach(((f) => {
        const m = iD(o.serializer, f);
        c.set(m.key.toString(), m);
      }));
      const C = [];
      return i.forEach(((f) => {
        const m = c.get(f.toString());
        Q(!!m, 55234, {
          key: f
        }), C.push(m);
      })), C;
    })(this.datastore, e);
    return t.forEach(((n) => this.recordVersion(n))), t;
  }
  set(e, t) {
    this.write(t.toMutation(e, this.precondition(e))), this.writtenDocs.add(e.toString());
  }
  update(e, t) {
    try {
      this.write(t.toMutation(e, this.preconditionForUpdate(e)));
    } catch (n) {
      this.lastTransactionError = n;
    }
    this.writtenDocs.add(e.toString());
  }
  delete(e) {
    this.write(new yB(e, this.precondition(e))), this.writtenDocs.add(e.toString());
  }
  async commit() {
    if (this.ensureCommitNotCalled(), this.lastTransactionError) throw this.lastTransactionError;
    const e = this.readVersions;
    this.mutations.forEach(((t) => {
      e.delete(t.key.toString());
    })), // For each document that was read but not written to, we want to perform
    // a `verify` operation.
    e.forEach(((t, n) => {
      const s = Y.fromPath(n);
      this.mutations.push(new kC(s, this.precondition(s)));
    })), await (async function(n, s) {
      const i = ne(n), o = {
        writes: s.map(((B) => sf(i.serializer, B)))
      };
      await i.tt("Commit", i.serializer.databaseId, he.emptyPath(), o);
    })(this.datastore, this.mutations), this.committed = !0;
  }
  recordVersion(e) {
    let t;
    if (e.isFoundDocument()) t = e.version;
    else {
      if (!e.isNoDocument()) throw $(50498, {
        Oc: e.constructor.name
      });
      t = ee.min();
    }
    const n = this.readVersions.get(e.key.toString());
    if (n) {
      if (!t.isEqual(n))
        throw new j(L.ABORTED, "Document version changed between two reads.");
    } else this.readVersions.set(e.key.toString(), t);
  }
  /**
   * Returns the version of this document when it was read in this transaction,
   * as a precondition, or no precondition if it was not read.
   */
  precondition(e) {
    const t = this.readVersions.get(e.toString());
    return !this.writtenDocs.has(e.toString()) && t ? t.isEqual(ee.min()) ? Xe.exists(!1) : Xe.updateTime(t) : Xe.none();
  }
  /**
   * Returns the precondition for a document if the operation is an update.
   */
  preconditionForUpdate(e) {
    const t = this.readVersions.get(e.toString());
    if (!this.writtenDocs.has(e.toString()) && t) {
      if (t.isEqual(ee.min()))
        throw new j(L.INVALID_ARGUMENT, "Can't update a document that doesn't exist.");
      return Xe.updateTime(t);
    }
    return Xe.exists(!0);
  }
  write(e) {
    this.ensureCommitNotCalled(), this.mutations.push(e);
  }
  ensureCommitNotCalled() {
  }
};
class jy {
  constructor(e, t, n, s, i) {
    this.asyncQueue = e, this.datastore = t, this.options = n, this.updateFunction = s, this.deferred = i, this.Mc = n.maxAttempts, this.jt = new OB(
      this.asyncQueue,
      "transaction_retry"
      /* TimerId.TransactionRetry */
    );
  }
  /** Runs the transaction and sets the result on deferred. */
  Nc() {
    this.Mc -= 1, this.Lc();
  }
  Lc() {
    this.jt.Ut((async () => {
      const e = new Jy(this.datastore), t = this.Bc(e);
      t && t.then(((n) => {
        this.asyncQueue.enqueueAndForget((() => e.commit().then((() => {
          this.deferred.resolve(n);
        })).catch(((s) => {
          this.Uc(s);
        }))));
      })).catch(((n) => {
        this.Uc(n);
      }));
    }));
  }
  Bc(e) {
    try {
      const t = this.updateFunction(e);
      return !ni(t) && t.catch && t.then ? t : (this.deferred.reject(Error("Transaction callback must return a Promise")), null);
    } catch (t) {
      return this.deferred.reject(t), null;
    }
  }
  Uc(e) {
    this.Mc > 0 && this.kc(e) ? (this.Mc -= 1, this.asyncQueue.enqueueAndForget((() => (this.Lc(), Promise.resolve())))) : this.deferred.reject(e);
  }
  kc(e) {
    if (e?.name === "FirebaseError") {
      const t = e.code;
      return t === "aborted" || t === "failed-precondition" || t === "already-exists" || !zC(t);
    }
    return !1;
  }
}
const Nn = "FirestoreClient";
class qy {
  constructor(e, t, n, s, i) {
    this.authCredentials = e, this.appCheckCredentials = t, this.asyncQueue = n, this._databaseInfo = s, this.user = Ke.UNAUTHENTICATED, this.clientId = EB.newId(), this.authCredentialListener = () => Promise.resolve(), this.appCheckCredentialListener = () => Promise.resolve(), this._uninitializedComponentsProvider = i, this.authCredentials.start(n, (async (o) => {
      q(Nn, "Received user=", o.uid), await this.authCredentialListener(o), this.user = o;
    })), this.appCheckCredentials.start(n, ((o) => (q(Nn, "Received new app check token=", o), this.appCheckCredentialListener(o, this.user))));
  }
  get configuration() {
    return {
      asyncQueue: this.asyncQueue,
      databaseInfo: this._databaseInfo,
      clientId: this.clientId,
      authCredentials: this.authCredentials,
      appCheckCredentials: this.appCheckCredentials,
      initialUser: this.user,
      maxConcurrentLimboResolutions: 100
    };
  }
  setCredentialChangeListener(e) {
    this.authCredentialListener = e;
  }
  setAppCheckTokenChangeListener(e) {
    this.appCheckCredentialListener = e;
  }
  terminate() {
    this.asyncQueue.enterRestrictedMode();
    const e = new En();
    return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async () => {
      try {
        this._onlineComponents && await this._onlineComponents.terminate(), this._offlineComponents && await this._offlineComponents.terminate(), // The credentials provider must be terminated after shutting down the
        // RemoteStore as it will prevent the RemoteStore from retrieving auth
        // tokens.
        this.authCredentials.shutdown(), this.appCheckCredentials.shutdown(), e.resolve();
      } catch (t) {
        const n = ru(t, "Failed to shutdown persistence");
        e.reject(n);
      }
    })), e.promise;
  }
}
async function Pa(r, e) {
  r.asyncQueue.verifyOperationInProgress(), q(Nn, "Initializing OfflineComponentProvider");
  const t = r.configuration;
  await e.initialize(t);
  let n = t.initialUser;
  r.setCredentialChangeListener((async (s) => {
    n.isEqual(s) || (await jf(e.localStore, s), n = s);
  })), // When a user calls clearPersistence() in one client, all other clients
  // need to be terminated to allow the delete to succeed.
  e.persistence.setDatabaseDeletedListener((() => r.terminate())), r._offlineComponents = e;
}
async function rh(r, e) {
  r.asyncQueue.verifyOperationInProgress();
  const t = await Ky(r);
  q(Nn, "Initializing OnlineComponentProvider"), await e.initialize(t, r.configuration), // The CredentialChangeListener of the online component provider takes
  // precedence over the offline component provider.
  r.setCredentialChangeListener(((n) => Yl(e.remoteStore, n))), r.setAppCheckTokenChangeListener(((n, s) => Yl(e.remoteStore, s))), r._onlineComponents = e;
}
async function Ky(r) {
  if (!r._offlineComponents) if (r._uninitializedComponentsProvider) {
    q(Nn, "Using user provided OfflineComponentProvider");
    try {
      await Pa(r, r._uninitializedComponentsProvider._offline);
    } catch (e) {
      const t = e;
      if (!(function(s) {
        return s.name === "FirebaseError" ? s.code === L.FAILED_PRECONDITION || s.code === L.UNIMPLEMENTED : !(typeof DOMException < "u" && s instanceof DOMException) || // When the browser is out of quota we could get either quota exceeded
        // or an aborted error depending on whether the error happened during
        // schema migration.
        s.code === 22 || s.code === 20 || // Firefox Private Browsing mode disables IndexedDb and returns
        // INVALID_STATE for any usage.
        s.code === 11;
      })(t)) throw t;
      Tt("Error using user provided cache. Falling back to memory cache: " + t), await Pa(r, new go());
    }
  } else q(Nn, "Using default OfflineComponentProvider"), await Pa(r, new Uy(void 0));
  return r._offlineComponents;
}
async function au(r) {
  return r._onlineComponents || (r._uninitializedComponentsProvider ? (q(Nn, "Using user provided OnlineComponentProvider"), await rh(r, r._uninitializedComponentsProvider._online)) : (q(Nn, "Using default OnlineComponentProvider"), await rh(r, new sB()))), r._onlineComponents;
}
function zy(r) {
  return au(r).then(((e) => e.syncEngine));
}
function Qy(r) {
  return au(r).then(((e) => e.datastore));
}
async function sh(r) {
  const e = await au(r), t = e.eventManager;
  return t.onListen = Py.bind(null, e.syncEngine), t.onUnlisten = by.bind(null, e.syncEngine), t.onFirstRemoteStoreListen = Sy.bind(null, e.syncEngine), t.onLastRemoteStoreUnlisten = Ny.bind(null, e.syncEngine), t;
}
function Wy(r, e, t, n) {
  const s = new py(n), i = new yy(e, s, t);
  return r.asyncQueue.enqueueAndForget((async () => _y(await sh(r), i))), () => {
    s.Aa(), r.asyncQueue.enqueueAndForget((async () => Dy(await sh(r), i)));
  };
}
function $y(r, e) {
  const t = new En();
  return r.asyncQueue.enqueueAndForget((async () => Fy(await zy(r), e, t))), t.promise;
}
function Yy(r, e, t) {
  const n = new En();
  return r.asyncQueue.enqueueAndForget((async () => {
    const s = await Qy(r);
    new jy(r.asyncQueue, s, t, e, n).Nc();
  })), n.promise;
}
let mo = class {
  // Note: This class is stripped down version of the DocumentSnapshot in
  // the legacy SDK. The changes are:
  // - No support for SnapshotMetadata.
  // - No support for SnapshotOptions.
  /** @hideconstructor protected */
  constructor(e, t, n, s, i) {
    this._firestore = e, this._userDataWriter = t, this._key = n, this._document = s, this._converter = i;
  }
  /** Property of the `DocumentSnapshot` that provides the document's ID. */
  get id() {
    return this._key.path.lastSegment();
  }
  /**
   * The `DocumentReference` for the document included in the `DocumentSnapshot`.
   */
  get ref() {
    return new Te(this._firestore, this._converter, this._key);
  }
  /**
   * Signals whether or not the document at the snapshot's location exists.
   *
   * @returns true if the document exists.
   */
  exists() {
    return this._document !== null;
  }
  /**
   * Retrieves all fields in the document as an `Object`. Returns `undefined` if
   * the document doesn't exist.
   *
   * @returns An `Object` containing all fields in the document or `undefined`
   * if the document doesn't exist.
   */
  data() {
    if (this._document) {
      if (this._converter) {
        const e = new Xy(
          this._firestore,
          this._userDataWriter,
          this._key,
          this._document,
          /* converter= */
          null
        );
        return this._converter.fromFirestore(e);
      }
      return this._userDataWriter.convertValue(this._document.data.value);
    }
  }
  /**
   * @internal
   * @private
   *
   * Retrieves all fields in the document as a proto Value. Returns `undefined` if
   * the document doesn't exist.
   *
   * @returns An `Object` containing all fields in the document or `undefined`
   * if the document doesn't exist.
   */
  _fieldsProto() {
    return this._document?.data.clone().value.mapValue.fields ?? void 0;
  }
  /**
   * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
   * document or field doesn't exist.
   *
   * @param fieldPath - The path (for example 'foo' or 'foo.bar') to a specific
   * field.
   * @returns The data at the specified field location or undefined if no such
   * field exists in the document.
   */
  // We are using `any` here to avoid an explicit cast by our users.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(e) {
    if (this._document) {
      const t = this._document.data.field(nr("DocumentSnapshot.get", e));
      if (t !== null) return this._userDataWriter.convertValue(t);
    }
  }
}, Xy = class extends mo {
  /**
   * Retrieves all fields in the document as an `Object`.
   *
   * @override
   * @returns An `Object` containing all fields in the document.
   */
  data() {
    return super.data();
  }
};
class od {
  convertValue(e, t = "none") {
    switch (Le(e)) {
      case 0:
        return null;
      case 1:
        return e.booleanValue;
      case 2:
        return ye(e.integerValue || e.doubleValue);
      case 3:
        return this.convertTimestamp(e.timestampValue);
      case 4:
        return this.convertServerTimestamp(e, t);
      case 5:
        return e.stringValue;
      case 6:
        return this.convertBytes(Tn(e.bytesValue));
      case 7:
        return this.convertReference(e.referenceValue);
      case 8:
        return this.convertGeoPoint(e.geoPointValue);
      case 9:
        return this.convertArray(e.arrayValue, t);
      case 11:
        return this.convertObject(e.mapValue, t);
      case 10:
        return this.convertVectorValue(e.mapValue);
      default:
        throw $(62114, {
          value: e
        });
    }
  }
  convertObject(e, t) {
    return this.convertObjectMap(e.fields, t);
  }
  /**
   * @internal
   */
  convertObjectMap(e, t = "none") {
    const n = {};
    return Ln(e, ((s, i) => {
      n[s] = this.convertValue(i, t);
    })), n;
  }
  /**
   * @internal
   */
  convertVectorValue(e) {
    const t = e.fields?.[bs].arrayValue?.values?.map(((n) => ye(n.doubleValue)));
    return new ot(t);
  }
  convertGeoPoint(e) {
    return new Lt(ye(e.latitude), ye(e.longitude));
  }
  convertArray(e, t) {
    return (e.values || []).map(((n) => this.convertValue(n, t)));
  }
  convertServerTimestamp(e, t) {
    switch (t) {
      case "previous":
        const n = ti(e);
        return n == null ? null : this.convertValue(n, t);
      case "estimate":
        return this.convertTimestamp(Pr(e));
      default:
        return null;
    }
  }
  convertTimestamp(e) {
    const t = yn(e);
    return new _e(t.seconds, t.nanos);
  }
  convertDocumentKey(e, t) {
    const n = he.fromString(e);
    Q(Bf(n), 9688, {
      name: e
    });
    const s = new Ss(n.get(1), n.get(3)), i = new Y(n.popFirst(5));
    return s.isEqual(t) || // TODO(b/64130202): Somehow support foreign references.
    Qt(`A document reference to ${i} refers to a different database (${s.projectId}/${s.database}), which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`), i;
  }
}
function ad(r, e, t) {
  let n;
  return n = r ? t && (t.merge || t.mergeFields) ? r.toFirestore(e, t) : r.toFirestore(e) : e, n;
}
class Zy extends od {
  constructor(e) {
    super(), this.firestore = e;
  }
  convertBytes(e) {
    return new ft(e);
  }
  convertReference(e) {
    const t = this.convertDocumentKey(e, this.firestore._databaseId);
    return new Te(
      this.firestore,
      /* converter= */
      null,
      t
    );
  }
}
const ih = "AsyncQueue";
class oh {
  constructor(e = Promise.resolve()) {
    this.qc = [], // Is this AsyncQueue being shut down? Once it is set to true, it will not
    // be changed again.
    this.$c = !1, // Operations scheduled to be queued in the future. Operations are
    // automatically removed after they are run or canceled.
    this.Kc = [], // visible for testing
    this.Qc = null, // Flag set while there's an outstanding AsyncQueue operation, used for
    // assertion sanity-checks.
    this.Wc = !1, // Enabled during shutdown on Safari to prevent future access to IndexedDB.
    this.Gc = !1, // List of TimerIds to fast-forward delays for.
    this.zc = [], // Backoff timer used to schedule retries for retryable operations
    this.jt = new OB(
      this,
      "async_queue_retry"
      /* TimerId.AsyncQueueRetry */
    ), // Visibility handler that triggers an immediate retry of all retryable
    // operations. Meant to speed up recovery when we regain file system access
    // after page comes into foreground.
    this.jc = () => {
      const n = va();
      n && q(ih, "Visibility state changed to " + n.visibilityState), this.jt.qt();
    }, this.Hc = e;
    const t = va();
    t && typeof t.addEventListener == "function" && t.addEventListener("visibilitychange", this.jc);
  }
  get isShuttingDown() {
    return this.$c;
  }
  /**
   * Adds a new operation to the queue without waiting for it to complete (i.e.
   * we ignore the Promise result).
   */
  enqueueAndForget(e) {
    this.enqueue(e);
  }
  enqueueAndForgetEvenWhileRestricted(e) {
    this.Jc(), // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.Yc(e);
  }
  enterRestrictedMode(e) {
    if (!this.$c) {
      this.$c = !0, this.Gc = e || !1;
      const t = va();
      t && typeof t.removeEventListener == "function" && t.removeEventListener("visibilitychange", this.jc);
    }
  }
  enqueue(e) {
    if (this.Jc(), this.$c)
      return new Promise((() => {
      }));
    const t = new En();
    return this.Yc((() => this.$c && this.Gc ? Promise.resolve() : (e().then(t.resolve, t.reject), t.promise))).then((() => t.promise));
  }
  enqueueRetryable(e) {
    this.enqueueAndForget((() => (this.qc.push(e), this.Zc())));
  }
  /**
   * Runs the next operation from the retryable queue. If the operation fails,
   * reschedules with backoff.
   */
  async Zc() {
    if (this.qc.length !== 0) {
      try {
        await this.qc[0](), this.qc.shift(), this.jt.reset();
      } catch (e) {
        if (!Gr(e)) throw e;
        q(ih, "Operation failed with retryable error: " + e);
      }
      this.qc.length > 0 && // If there are additional operations, we re-schedule `retryNextOp()`.
      // This is necessary to run retryable operations that failed during
      // their initial attempt since we don't know whether they are already
      // enqueued. If, for example, `op1`, `op2`, `op3` are enqueued and `op1`
      // needs to  be re-run, we will run `op1`, `op1`, `op2` using the
      // already enqueued calls to `retryNextOp()`. `op3()` will then run in the
      // call scheduled here.
      // Since `backoffAndRun()` cancels an existing backoff and schedules a
      // new backoff on every call, there is only ever a single additional
      // operation in the queue.
      this.jt.Ut((() => this.Zc()));
    }
  }
  Yc(e) {
    const t = this.Hc.then((() => (this.Wc = !0, e().catch(((n) => {
      throw this.Qc = n, this.Wc = !1, Qt("INTERNAL UNHANDLED ERROR: ", ah(n)), n;
    })).then(((n) => (this.Wc = !1, n))))));
    return this.Hc = t, t;
  }
  enqueueAfterDelay(e, t, n) {
    this.Jc(), // Fast-forward delays for timerIds that have been overridden.
    this.zc.indexOf(e) > -1 && (t = 0);
    const s = nu.createAndSchedule(this, e, t, n, ((i) => this.Xc(i)));
    return this.Kc.push(s), s;
  }
  Jc() {
    this.Qc && $(47125, {
      el: ah(this.Qc)
    });
  }
  verifyOperationInProgress() {
  }
  /**
   * Waits until all currently queued tasks are finished executing. Delayed
   * operations are not run.
   */
  async tl() {
    let e;
    do
      e = this.Hc, await e;
    while (e !== this.Hc);
  }
  /**
   * For Tests: Determine if a delayed operation with a particular TimerId
   * exists.
   */
  nl(e) {
    for (const t of this.Kc) if (t.timerId === e) return !0;
    return !1;
  }
  /**
   * For Tests: Runs some or all delayed operations early.
   *
   * @param lastTimerId - Delayed operations up to and including this TimerId
   * will be drained. Pass TimerId.All to run all delayed operations.
   * @returns a Promise that resolves once all operations have been run.
   */
  rl(e) {
    return this.tl().then((() => {
      this.Kc.sort(((t, n) => t.targetTimeMs - n.targetTimeMs));
      for (const t of this.Kc) if (t.skipDelay(), e !== "all" && t.timerId === e) break;
      return this.tl();
    }));
  }
  /**
   * For Tests: Skip all subsequent delays for a timer id.
   */
  il(e) {
    this.zc.push(e);
  }
  /** Called once a DelayedOperation is run or canceled. */
  Xc(e) {
    const t = this.Kc.indexOf(e);
    this.Kc.splice(t, 1);
  }
}
function ah(r) {
  let e = r.message || "";
  return r.stack && (e = r.stack.includes(r.message) ? r.stack : r.message + `
` + r.stack), e;
}
class Fr extends bo {
  /** @hideconstructor */
  constructor(e, t, n, s) {
    super(e, t, n, s), /**
     * Whether it's a {@link Firestore} or Firestore Lite instance.
     */
    this.type = "firestore", this._queue = new oh(), this._persistenceKey = s?.name || "[DEFAULT]";
  }
  async _terminate() {
    if (this._firestoreClient) {
      const e = this._firestoreClient.terminate();
      this._queue = new oh(e), this._firestoreClient = void 0, await e;
    }
  }
}
function DT(r, e) {
  const t = typeof r == "object" ? r : wh(), n = typeof r == "string" ? r : e || ro, s = aB(t, "firestore").getImmediate({
    identifier: n
  });
  if (!s._initialized) {
    const i = Xd("firestore");
    i && jD(s, ...i);
  }
  return s;
}
function Bu(r) {
  if (r._terminated) throw new j(L.FAILED_PRECONDITION, "The client has already been terminated.");
  return r._firestoreClient || eT(r), r._firestoreClient;
}
function eT(r) {
  const e = r._freezeSettings(), t = LD(r._databaseId, r._app?.options.appId || "", r._persistenceKey, r._app?.options.apiKey, e);
  r._componentsProvider || e.localCache?._offlineComponentProvider && e.localCache?._onlineComponentProvider && (r._componentsProvider = {
    _offline: e.localCache._offlineComponentProvider,
    _online: e.localCache._onlineComponentProvider
  }), r._firestoreClient = new qy(r._authCredentials, r._appCheckCredentials, r._queue, t, r._componentsProvider && (function(s) {
    const i = s?._online.build();
    return {
      _offline: s?._offline.build(i),
      _online: i
    };
  })(r._componentsProvider));
}
class uu extends od {
  constructor(e) {
    super(), this.firestore = e;
  }
  convertBytes(e) {
    return new ft(e);
  }
  convertReference(e) {
    const t = this.convertDocumentKey(e, this.firestore._databaseId);
    return new Te(
      this.firestore,
      /* converter= */
      null,
      t
    );
  }
}
class Er {
  /** @hideconstructor */
  constructor(e, t) {
    this.hasPendingWrites = e, this.fromCache = t;
  }
  /**
   * Returns true if this `SnapshotMetadata` is equal to the provided one.
   *
   * @param other - The `SnapshotMetadata` to compare against.
   * @returns true if this `SnapshotMetadata` is equal to the provided one.
   */
  isEqual(e) {
    return this.hasPendingWrites === e.hasPendingWrites && this.fromCache === e.fromCache;
  }
}
class wn extends mo {
  /** @hideconstructor protected */
  constructor(e, t, n, s, i, o) {
    super(e, t, n, s, o), this._firestore = e, this._firestoreImpl = e, this.metadata = i;
  }
  /**
   * Returns whether or not the data exists. True if the document exists.
   */
  exists() {
    return super.exists();
  }
  /**
   * Retrieves all fields in the document as an `Object`. Returns `undefined` if
   * the document doesn't exist.
   *
   * By default, `serverTimestamp()` values that have not yet been
   * set to their final value will be returned as `null`. You can override
   * this by passing an options object.
   *
   * @param options - An options object to configure how data is retrieved from
   * the snapshot (for example the desired behavior for server timestamps that
   * have not yet been set to their final value).
   * @returns An `Object` containing all fields in the document or `undefined` if
   * the document doesn't exist.
   */
  data(e = {}) {
    if (this._document) {
      if (this._converter) {
        const t = new Qi(
          this._firestore,
          this._userDataWriter,
          this._key,
          this._document,
          this.metadata,
          /* converter= */
          null
        );
        return this._converter.fromFirestore(t, e);
      }
      return this._userDataWriter.convertValue(this._document.data.value, e.serverTimestamps);
    }
  }
  /**
   * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
   * document or field doesn't exist.
   *
   * By default, a `serverTimestamp()` that has not yet been set to
   * its final value will be returned as `null`. You can override this by
   * passing an options object.
   *
   * @param fieldPath - The path (for example 'foo' or 'foo.bar') to a specific
   * field.
   * @param options - An options object to configure how the field is retrieved
   * from the snapshot (for example the desired behavior for server timestamps
   * that have not yet been set to their final value).
   * @returns The data at the specified field location or undefined if no such
   * field exists in the document.
   */
  // We are using `any` here to avoid an explicit cast by our users.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(e, t = {}) {
    if (this._document) {
      const n = this._document.data.field(nr("DocumentSnapshot.get", e));
      if (n !== null) return this._userDataWriter.convertValue(n, t.serverTimestamps);
    }
  }
  /**
   * Returns a JSON-serializable representation of this `DocumentSnapshot` instance.
   *
   * @returns a JSON representation of this object.  Throws a {@link FirestoreError} if this
   * `DocumentSnapshot` has pending writes.
   */
  toJSON() {
    if (this.metadata.hasPendingWrites) throw new j(L.FAILED_PRECONDITION, "DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");
    const e = this._document, t = {};
    return t.type = wn._jsonSchemaVersion, t.bundle = "", t.bundleSource = "DocumentSnapshot", t.bundleName = this._key.toString(), !e || !e.isValidDocument() || !e.isFoundDocument() ? t : (this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields, "previous"), t.bundle = (this._firestore, this.ref.path, "NOT SUPPORTED"), t);
  }
}
wn._jsonSchemaVersion = "firestore/documentSnapshot/1.0", wn._jsonSchema = {
  type: be("string", wn._jsonSchemaVersion),
  bundleSource: be("string", "DocumentSnapshot"),
  bundleName: be("string"),
  bundle: be("string")
};
class Qi extends wn {
  /**
   * Retrieves all fields in the document as an `Object`.
   *
   * By default, `serverTimestamp()` values that have not yet been
   * set to their final value will be returned as `null`. You can override
   * this by passing an options object.
   *
   * @override
   * @param options - An options object to configure how data is retrieved from
   * the snapshot (for example the desired behavior for server timestamps that
   * have not yet been set to their final value).
   * @returns An `Object` containing all fields in the document.
   */
  data(e = {}) {
    return super.data(e);
  }
}
class yr {
  /** @hideconstructor */
  constructor(e, t, n, s) {
    this._firestore = e, this._userDataWriter = t, this._snapshot = s, this.metadata = new Er(s.hasPendingWrites, s.fromCache), this.query = n;
  }
  /** An array of all the documents in the `QuerySnapshot`. */
  get docs() {
    const e = [];
    return this.forEach(((t) => e.push(t))), e;
  }
  /** The number of documents in the `QuerySnapshot`. */
  get size() {
    return this._snapshot.docs.size;
  }
  /** True if there are no documents in the `QuerySnapshot`. */
  get empty() {
    return this.size === 0;
  }
  /**
   * Enumerates all of the documents in the `QuerySnapshot`.
   *
   * @param callback - A callback to be called with a `QueryDocumentSnapshot` for
   * each document in the snapshot.
   * @param thisArg - The `this` binding for the callback.
   */
  forEach(e, t) {
    this._snapshot.docs.forEach(((n) => {
      e.call(t, new Qi(this._firestore, this._userDataWriter, n.key, n, new Er(this._snapshot.mutatedKeys.has(n.key), this._snapshot.fromCache), this.query.converter));
    }));
  }
  /**
   * Returns an array of the documents changes since the last snapshot. If this
   * is the first snapshot, all documents will be in the list as 'added'
   * changes.
   *
   * @param options - `SnapshotListenOptions` that control whether metadata-only
   * changes (i.e. only `DocumentSnapshot.metadata` changed) should trigger
   * snapshot events.
   */
  docChanges(e = {}) {
    const t = !!e.includeMetadataChanges;
    if (t && this._snapshot.excludesMetadataChanges) throw new j(L.INVALID_ARGUMENT, "To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");
    return this._cachedChanges && this._cachedChangesIncludeMetadataChanges === t || (this._cachedChanges = /** Calculates the array of `DocumentChange`s for a given `ViewSnapshot`. */
    (function(s, i) {
      if (s._snapshot.oldDocs.isEmpty()) {
        let o = 0;
        return s._snapshot.docChanges.map(((B) => {
          Ve(s._snapshot.query) ? Za(s._snapshot.query) : AB(s.query._query);
          const u = new Qi(s._firestore, s._userDataWriter, B.doc.key, B.doc, new Er(s._snapshot.mutatedKeys.has(B.doc.key), s._snapshot.fromCache), s.query.converter);
          return B.doc, {
            type: "added",
            doc: u,
            oldIndex: -1,
            newIndex: o++
          };
        }));
      }
      {
        let o = s._snapshot.oldDocs;
        return s._snapshot.docChanges.filter(((B) => i || B.type !== 3)).map(((B) => {
          const u = new Qi(s._firestore, s._userDataWriter, B.doc.key, B.doc, new Er(s._snapshot.mutatedKeys.has(B.doc.key), s._snapshot.fromCache), s.query.converter);
          let c = -1, C = -1;
          return B.type !== 0 && (c = o.indexOf(B.doc.key), o = o.delete(B.doc.key)), B.type !== 1 && (o = o.add(B.doc), C = o.indexOf(B.doc.key)), {
            type: tT(B.type),
            doc: u,
            oldIndex: c,
            newIndex: C
          };
        }));
      }
    })(this, t), this._cachedChangesIncludeMetadataChanges = t), this._cachedChanges;
  }
  /**
   * Returns a JSON-serializable representation of this `QuerySnapshot` instance.
   *
   * @returns a JSON representation of this object. Throws a {@link FirestoreError} if this
   * `QuerySnapshot` has pending writes.
   */
  toJSON() {
    if (this.metadata.hasPendingWrites) throw new j(L.FAILED_PRECONDITION, "QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");
    const e = {};
    e.type = yr._jsonSchemaVersion, e.bundleSource = "QuerySnapshot", e.bundleName = EB.newId(), this._firestore._databaseId.database, this._firestore._databaseId.projectId;
    const t = [], n = [], s = [];
    return this.docs.forEach(((i) => {
      i._document !== null && (t.push(i._document), n.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields, "previous")), s.push(i.ref.path));
    })), e.bundle = (this._firestore, this.query._query, e.bundleName, "NOT SUPPORTED"), e;
  }
}
function tT(r) {
  switch (r) {
    case 0:
      return "added";
    case 2:
    case 3:
      return "modified";
    case 1:
      return "removed";
    default:
      return $(61501, {
        type: r
      });
  }
}
yr._jsonSchemaVersion = "firestore/querySnapshot/1.0", yr._jsonSchema = {
  type: be("string", yr._jsonSchemaVersion),
  bundleSource: be("string", "QuerySnapshot"),
  bundleName: be("string"),
  bundle: be("string")
};
function nT(r) {
  if (r.limitType === "L" && r.explicitOrderBy.length === 0) throw new j(L.UNIMPLEMENTED, "limitToLast() queries require specifying at least one orderBy() clause");
}
class cu {
}
class rT extends cu {
}
function IT(r, e, ...t) {
  let n = [];
  e instanceof cu && n.push(e), n = n.concat(t), (function(i) {
    const o = i.filter(((u) => u instanceof lu)).length, B = i.filter(((u) => u instanceof Jo)).length;
    if (o > 1 || o > 0 && B > 0) throw new j(L.INVALID_ARGUMENT, "InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.");
  })(n);
  for (const s of n) r = s._apply(r);
  return r;
}
class Jo extends rT {
  /**
   * @internal
   */
  constructor(e, t, n) {
    super(), this._field = e, this._op = t, this._value = n, /** The type of this query constraint */
    this.type = "where";
  }
  static _create(e, t, n) {
    return new Jo(e, t, n);
  }
  _apply(e) {
    const t = this._parse(e);
    return Bd(e._query, t), new Hr(e.firestore, e.converter, Ka(e._query, t));
  }
  _parse(e) {
    const t = No(e.firestore);
    return (function(i, o, B, u, c, C, f) {
      let m;
      if (c.isKeyField()) {
        if (C === "array-contains" || C === "array-contains-any") throw new j(L.INVALID_ARGUMENT, `Invalid Query. You can't perform '${C}' queries on documentId().`);
        if (C === "in" || C === "not-in") {
          uh(f, C);
          const P = [];
          for (const x of f) P.push(Bh(u, i, x));
          m = {
            arrayValue: {
              values: P
            }
          };
        } else m = Bh(u, i, f);
      } else C !== "in" && C !== "not-in" && C !== "array-contains-any" || uh(f, C), m = QD(
        B,
        o,
        f,
        /* allowArrays= */
        C === "in" || C === "not-in"
      );
      return Oe.create(c, C, m);
    })(e._query, "where", t, e.firestore._databaseId, this._field, this._op, this._value);
  }
}
function wT(r, e, t) {
  const n = e, s = nr("where", r);
  return Jo._create(s, n, t);
}
class lu extends cu {
  /**
   * @internal
   */
  constructor(e, t) {
    super(), this.type = e, this._queryConstraints = t;
  }
  static _create(e, t) {
    return new lu(e, t);
  }
  _parse(e) {
    const t = this._queryConstraints.map(((n) => n._parse(e))).filter(((n) => n.getFilters().length > 0));
    return t.length === 1 ? t[0] : At.create(t, this._getOperator());
  }
  _apply(e) {
    const t = this._parse(e);
    return t.getFilters().length === 0 ? e : ((function(s, i) {
      let o = s;
      const B = i.getFlattenedFilters();
      for (const u of B) Bd(o, u), o = Ka(o, u);
    })(e._query, t), new Hr(e.firestore, e.converter, Ka(e._query, t)));
  }
  _getQueryConstraints() {
    return this._queryConstraints;
  }
  _getOperator() {
    return this.type === "and" ? "and" : "or";
  }
}
function Bh(r, e, t) {
  if (typeof (t = Re(t)) == "string") {
    if (t === "") throw new j(L.INVALID_ARGUMENT, "Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");
    if (!KC(e) && t.indexOf("/") !== -1) throw new j(L.INVALID_ARGUMENT, `Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);
    const n = e.path.child(he.fromString(t));
    if (!Y.isDocumentKey(n)) throw new j(L.INVALID_ARGUMENT, `Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${n}' is not because it has an odd number of segments (${n.length}).`);
    return wl(r, new Y(n));
  }
  if (t instanceof Te) return wl(r, t._key);
  throw new j(L.INVALID_ARGUMENT, `Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${yo(t)}.`);
}
function uh(r, e) {
  if (!Array.isArray(r) || r.length === 0) throw new j(L.INVALID_ARGUMENT, `Invalid Query. A non-empty array is required for '${e.toString()}' filters.`);
}
function Bd(r, e) {
  const t = (function(s, i) {
    for (const o of s) for (const B of o.getFlattenedFilters()) if (i.indexOf(B.op) >= 0) return B.op;
    return null;
  })(r.filters, (function(s) {
    switch (s) {
      case "!=":
        return [
          "!=",
          "not-in"
          /* Operator.NOT_IN */
        ];
      case "array-contains-any":
      case "in":
        return [
          "not-in"
          /* Operator.NOT_IN */
        ];
      case "not-in":
        return [
          "array-contains-any",
          "in",
          "not-in",
          "!="
          /* Operator.NOT_EQUAL */
        ];
      default:
        return [];
    }
  })(e.op));
  if (t !== null)
    throw t === e.op ? new j(L.INVALID_ARGUMENT, `Invalid query. You cannot use more than one '${e.op.toString()}' filter.`) : new j(L.INVALID_ARGUMENT, `Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`);
}
function ch(r) {
  return (function(t, n) {
    if (typeof t != "object" || t === null) return !1;
    const s = t;
    for (const i of n) if (i in s && typeof s[i] == "function") return !0;
    return !1;
  })(r, ["next", "error", "complete"]);
}
const sT = {
  maxAttempts: 5
};
function ds(r, e) {
  if ((r = Re(r)).firestore !== e) throw new j(L.INVALID_ARGUMENT, "Provided document reference is from a different Firestore instance.");
  return r;
}
let iT = class {
  /** @hideconstructor */
  constructor(e, t) {
    this._firestore = e, this._transaction = t, this._dataReader = No(e);
  }
  /**
   * Reads the document referenced by the provided {@link DocumentReference}.
   *
   * @param documentRef - A reference to the document to be read.
   * @returns A `DocumentSnapshot` with the read data.
   */
  get(e) {
    const t = ds(e, this._firestore), n = new Zy(this._firestore);
    return this._transaction.lookup([t._key]).then(((s) => {
      if (!s || s.length !== 1) return $(24041);
      const i = s[0];
      if (i.isFoundDocument()) return new mo(this._firestore, n, i.key, i, t.converter);
      if (i.isNoDocument()) return new mo(this._firestore, n, t._key, null, t.converter);
      throw $(18433, {
        doc: i
      });
    }));
  }
  set(e, t, n) {
    const s = ds(e, this._firestore), i = ad(s.converter, t, n), o = mf(this._dataReader, "Transaction.set", s._key, i, s.converter !== null, n);
    return this._transaction.set(s._key, o), this;
  }
  update(e, t, n, ...s) {
    const i = ds(e, this._firestore);
    let o;
    return o = typeof (t = Re(t)) == "string" || t instanceof ai ? _f(this._dataReader, "Transaction.update", i._key, t, n, s) : Ef(this._dataReader, "Transaction.update", i._key, t), this._transaction.update(i._key, o), this;
  }
  /**
   * Deletes the document referred to by the provided {@link DocumentReference}.
   *
   * @param documentRef - A reference to the document to be deleted.
   * @returns This `Transaction` instance. Used for chaining method calls.
   */
  delete(e) {
    const t = ds(e, this._firestore);
    return this._transaction.delete(t._key), this;
  }
};
class oT extends iT {
  // This class implements the same logic as the Transaction API in the Lite SDK
  // but is subclassed in order to return its own DocumentSnapshot types.
  /** @hideconstructor */
  constructor(e, t) {
    super(e, t), this._firestore = e;
  }
  /**
   * Reads the document referenced by the provided {@link DocumentReference}.
   *
   * @param documentRef - A reference to the document to be read.
   * @returns A `DocumentSnapshot` with the read data.
   */
  get(e) {
    const t = ds(e, this._firestore), n = new uu(this._firestore);
    return super.get(e).then(((s) => new wn(this._firestore, n, t._key, s._document, new Er(
      /* hasPendingWrites= */
      !1,
      /* fromCache= */
      !1
    ), t.converter)));
  }
}
function TT(r, e, t) {
  r = jt(r, Fr);
  const n = {
    ...sT,
    ...t
  };
  (function(o) {
    if (o.maxAttempts < 1) throw new j(L.INVALID_ARGUMENT, "Max attempts must be at least 1");
  })(n);
  const s = Bu(r);
  return Yy(s, ((i) => e(new oT(r, i))), n);
}
function AT(r, e, t) {
  r = jt(r, Te);
  const n = jt(r.firestore, Fr), s = ad(r.converter, e, t), i = No(n);
  return ud(n, [mf(i, "setDoc", r._key, s, r.converter !== null, t).toMutation(r._key, Xe.none())]);
}
function RT(r, e, t, ...n) {
  r = jt(r, Te);
  const s = jt(r.firestore, Fr), i = No(s);
  let o;
  return o = typeof // For Compat types, we have to "extract" the underlying types before
  // performing validation.
  (e = Re(e)) == "string" || e instanceof ai ? _f(i, "updateDoc", r._key, e, t, n) : Ef(i, "updateDoc", r._key, e), ud(s, [o.toMutation(r._key, Xe.exists(!0))]);
}
function vT(r, ...e) {
  r = Re(r);
  let t = {
    includeMetadataChanges: !1,
    source: "default"
  }, n = 0;
  typeof e[n] != "object" || ch(e[n]) || (t = e[n++]);
  const s = {
    includeMetadataChanges: t.includeMetadataChanges,
    source: t.source
  };
  if (ch(e[n])) {
    const c = e[n];
    e[n] = c.next?.bind(c), e[n + 1] = c.error?.bind(c), e[n + 2] = c.complete?.bind(c);
  }
  let i, o, B;
  if (r instanceof Te) o = jt(r.firestore, Fr), B = TB(r._key.path), i = {
    next: (c) => {
      e[n] && e[n](aT(o, r, c));
    },
    error: e[n + 1],
    complete: e[n + 2]
  };
  else {
    const c = jt(r, Hr);
    o = jt(c.firestore, Fr), B = c._query;
    const C = new uu(o);
    i = {
      next: (f) => {
        e[n] && e[n](new yr(o, C, c, f));
      },
      error: e[n + 1],
      complete: e[n + 2]
    }, nT(r._query);
  }
  const u = Bu(o);
  return Wy(u, B, s, i);
}
function ud(r, e) {
  const t = Bu(r);
  return $y(t, e);
}
function aT(r, e, t) {
  const n = t.docs.get(e._key), s = new uu(r);
  return new wn(r, s, e._key, n, new Er(t.hasPendingWrites, t.fromCache), e.converter);
}
const lh = "@firebase/firestore", hh = "4.17.1";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function(e, t = !0) {
  a_(Lr), Tr(new Xn("firestore", ((n, { instanceIdentifier: s, options: i }) => {
    const o = n.getProvider("app").getImmediate(), B = new Fr(new _D(n.getProvider("auth-internal")), new wD(o, n.getProvider("app-check-internal")), p_(o, s), o);
    return i = {
      useFetchStreams: t,
      ...i
    }, B._setSettings(i), B;
  }), "PUBLIC").setMultipleInstances(!0)), pn(lh, hh, e), // BUILD_TARGET will be replaced by values like esm, cjs, etc during the compilation
  pn(lh, hh, "esm2020");
})();
export {
  pT as collection,
  gT as doc,
  wh as getApp,
  uT as getApps,
  CT as getAuth,
  DT as getFirestore,
  Cg as initializeApp,
  lT as onAuthStateChanged,
  vT as onSnapshot,
  IT as query,
  TT as runTransaction,
  AT as setDoc,
  cT as signInWithEmailAndPassword,
  hT as signOut,
  RT as updateDoc,
  wT as where
};
