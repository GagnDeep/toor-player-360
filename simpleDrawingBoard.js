! function (t, s) {
	"object" == typeof exports && "undefined" != typeof module ? module.exports = s() : "function" == typeof define && define.amd ? define(s) : (t = t || self).SimpleDrawingBoard = s()
}(this, (function () {
	"use strict";

	function t() {
		return "ontouchstart" in window.document
	}
	class s {
		constructor() {
			this._events = {}
		}
		on(t, s) {
			const e = this._events;
			t in e || (e[t] = []), e[t].push(s)
		}
		off(t, s) {
			const e = this._events;
			if (!(t in e)) return;
			s || (e[t] = []);
			const i = e[t].indexOf(s);
			i >= 0 && e[t].splice(i, 1)
		}
		trigger(t, s) {
			const e = this._events;
			if (t in e)
				for (let i = 0; i < e[t].length; i++) {
					const o = e[t][i];
					o.handleEvent ? o.handleEvent.call(this, s) : o.call(this, s)
				}
		}
	}
	class e {
		constructor() {
			this._items = []
		}
		get(t) {
			return this._items[t]
		}
		push(t) {
			this._items.push(t)
		}
		pop() {
			return this._items.length > 0 ? this._items.pop() : null
		}
		shift() {
			return this._items.length > 0 ? this._items.shift() : null
		}
		clear() {
			this._items.length = 0
		}
		size() {
			return this._items.length
		}
	}
	return class {
		constructor(t, i) {
			if (!(t instanceof HTMLCanvasElement)) throw new Error("Pass canvas element as first argument.");
			this.ev = new s, this.el = t, this.ctx = t.getContext("2d"), this._isDrawing = 0, this._timer = null, this._coords = {
				old: {
					x: 0,
					y: 0
				},
				oldMid: {
					x: 0,
					y: 0
				},
				current: {
					x: 0,
					y: 0
				}
			}, this._settings = {
				lineColor: "#aaa",
				lineSize: 5,
				boardColor: "transparent",
				historyDepth: 10,
				isTransparent: 1,
				isDrawMode: 1
			}, this._history = {
				prev: new e,
				next: new e
			}, this._initBoard(i)
		}
		setLineSize(t) {
			return this.ctx.lineWidth = 0 | t || 1, this
		}
		setLineColor(t) {
			return this.ctx.strokeStyle = t, this
		}
		fill(t) {
			return this._saveHistory(), this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height), this.ctx.fillStyle = t, this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height), this
		}
		clear() {
			const t = this._settings;
			if (this._saveHistory(), t.isTransparent) {
				const t = this.ctx.globalCompositeOperation;
				this.ctx.globalCompositeOperation = "destination-out", this.fill(this._settings.boardColor), this.ctx.globalCompositeOperation = t
			} else this.fill(this._settings.boardColor);
			return this
		}
		toggleMode() {
			const t = this._settings;
			return t.isDrawMode ? (this.setLineColor(t.boardColor), t.isTransparent && (this.ctx.globalCompositeOperation = "destination-out"), t.isDrawMode = 0) : (this.setLineColor(t.lineColor), t.isTransparent && (this.ctx.globalCompositeOperation = "source-over"), t.isDrawMode = 1), this.ev.trigger("toggleMode", t.isDrawMode), this
		}
		getImg() {
			return this.ctx.canvas.toDataURL("image/png")
		}
		setImg(t, s, e) {
			return s = s || !1, (e = e || !1) || this._saveHistory(), "string" == typeof t ? this._setImgByImgSrc(t, s) : this._setImgByDrawableEl(t, s), this
		}
		undo() {
			this._restoreFromHistory(!1)
		}
		redo() {
			this._restoreFromHistory(!0)
		}
		dispose() {
			this._unbindEvents(), cancelAnimationFrame(this._timer), this._timer = null, this._history.prev.clear(), this._history.next.clear(), this.ev.trigger("dispose")
		}
		_initBoard(t) {
			const s = this._settings;
			if (t)
				for (const e in t) s[e] = t[e];
			var e;
			("transparent" === (e = (e = s.boardColor).replace(/\s/g, "")) || "0)" === e.split(",")[3]) && (s.boardColor = "rgba(0,0,0,1)", s.isTransparent = 1), s.isDrawMode = 1, this.ctx.lineCap = this.ctx.lineJoin = "round", this.setLineSize(s.lineSize), this.setLineColor(s.lineColor), this._bindEvents(), this._draw()
		}
		_bindEvents() {
			const s = t() ? ["touchstart", "touchmove", "touchend", "touchcancel", "gesturestart"] : ["mousedown", "mousemove", "mouseup", "mouseout"];
			for (let t = 0, e = s.length; t < e; t++) this.el.addEventListener(s[t], this, !1)
		}
		_unbindEvents() {
			const s = t() ? ["touchstart", "touchmove", "touchend", "touchcancel", "gesturestart"] : ["mousedown", "mousemove", "mouseup", "mouseout"];
			for (let t = 0, e = s.length; t < e; t++) this.el.removeEventListener(s[t], this, !1)
		}
		_draw() {
			const t = this._coords.old.x === this._coords.current.x && this._coords.old.y === this._coords.current.y;
			if (this._isDrawing) {
				const s = this._getMidInputCoords(this._coords.current);
				this.ctx.beginPath(), this.ctx.moveTo(s.x, s.y), this.ctx.quadraticCurveTo(this._coords.old.x, this._coords.old.y, this._coords.oldMid.x, this._coords.oldMid.y), this.ctx.stroke(), this._coords.old = this._coords.current, this._coords.oldMid = s, t || this.ev.trigger("draw", this._coords.current)
			}
			this._timer = requestAnimationFrame(this._draw.bind(this))
		}
		_onInputDown(t) {
			this._saveHistory(), this._isDrawing = 1;
			const s = this._getInputCoords(t);
			this._coords.current = this._coords.old = s, this._coords.oldMid = this._getMidInputCoords(s), this.ev.trigger("drawBegin", this._coords.current)
		}
		_onInputMove(t) {
			this._coords.current = this._getInputCoords(t)
		}
		_onInputUp() {
			this._isDrawing = 0, this.ev.trigger("drawEnd", this._coords.current)
		}
		_onInputCancel() {
			this._isDrawing && this.ev.trigger("drawEnd", this._coords.current), this._isDrawing = 0
		}
		handleEvent(t) {
			switch (t.preventDefault(), t.stopPropagation(), t.type) {
				case "mousedown":
				case "touchstart":
					this._onInputDown(t);
					break;
				case "mousemove":
				case "touchmove":
					this._onInputMove(t);
					break;
				case "mouseup":
				case "touchend":
					this._onInputUp();
					break;
				case "mouseout":
				case "touchcancel":
				case "gesturestart":
					this._onInputCancel()
			}
		}
		_getInputCoords(s) {
			let e, i;
			t() ? (e = s.touches[0].pageX, i = s.touches[0].pageY) : (e = s.pageX, i = s.pageY);
			const o = this.el.getBoundingClientRect(),
				r = o.left + window.pageXOffset,
				n = o.top + window.pageYOffset;
			return {
				x: (e - r) * (this.el.width / o.width),
				y: (i - n) * (this.el.height / o.height)
			}
		}
		_getMidInputCoords(t) {
			return {
				x: this._coords.old.x + t.x >> 1,
				y: this._coords.old.y + t.y >> 1
			}
		}
		_setImgByImgSrc(t, s) {
			const e = this.ctx,
				i = e.globalCompositeOperation,
				o = new Image;
			o.onload = function () {
				e.globalCompositeOperation = "source-over", s || e.clearRect(0, 0, e.canvas.width, e.canvas.height), e.drawImage(o, 0, 0, e.canvas.width, e.canvas.height), e.globalCompositeOperation = i
			}, o.src = t
		}
		_setImgByDrawableEl(t, s) {
			if (! function (t) {
					return -1 !== ["img", "canvas", "video"].indexOf(t.tagName.toLowerCase())
				}(t)) return;
			const e = this.ctx,
				i = e.globalCompositeOperation;
			e.globalCompositeOperation = "source-over", s || e.clearRect(0, 0, e.canvas.width, e.canvas.height), e.drawImage(t, 0, 0, e.canvas.width, e.canvas.height), e.globalCompositeOperation = i
		}
		_saveHistory() {
			const t = this._history,
				s = this.getImg(),
				e = t.prev.get(t.prev.size() - 1);
			if (!e || s !== e) {
				for (; t.prev.size() >= this._settings.historyDepth;) t.prev.shift();
				t.prev.push(s), t.next.clear(), this.ev.trigger("save", s)
			}
		}
		_restoreFromHistory(t) {
			const s = this._history;
			let e = "next",
				i = "prev";
			t && (e = "prev", i = "next");
			const o = s[i].pop();
			if (null == o) return;
			const r = this.getImg(),
				n = s.next.get(s.next.size() - 1);
			n && n == r || s[e].push(r), this.setImg(o, !1, !0)
		}
	}
}));