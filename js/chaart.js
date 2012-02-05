/*
 * Chaart 0.1 - HTML 5 based javascript chart library based on Raphael
 *
 * Copyright (c) 2011 Gagandeep Singh (http://justgagan.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license) license.
 */

(function() {

// modified version of Raphael.fn.drawGrid() from the Raphael Analytics example
Raphael.fn.drawGrid = function(x, y, width, height, x_step, x_size, y_count, y_size) {
	var path,
		rowHeight,
		columnWidth;
	
	// frame border
	path = ["M", Math.round(x) + 0.5, Math.round(y) + 0.5,
			"L", Math.round(x + width) + 0.5, Math.round(y) + 0.5,
			Math.round(x + width) + 0.5, Math.round(y + height) + 0.5,
			Math.round(x) + 0.5, Math.round(y + height) + 0.5,
			Math.round(x) + 0.5, Math.round(y) + 0.5];
	
	// horizontal lines
	rowHeight = Math.ceil(height / y_count);
	for (var i = 0; i < y_count; i++) {
		path = path.concat(["M", Math.round(x) + 0.5, Math.round(y + i * rowHeight) + 0.5,
							"H", Math.round(x + width) + 0.5]);
	}
	
	// vertical lines
	if (!x_step) {
		x_step = 1;
		x_size = 10;
	}
	columnWidth = Math.ceil(width / x_size);
	for (i = 0; i < x_size; i+= x_step) {
		path = path.concat(["M", Math.round(x + i * (columnWidth + 1.1)) + 0.5, Math.round(y) + 0.5,
							"V", Math.round(y + height) + 0.5]);
	}
	
	return this.path(path.join(","));
};

Raphael.fn.popup = function(X, Y, set, position, ret) {
	var pos = String(position || "top-middle").split("-"),
		pos_x = pos[1] || "middle",
		tokenRegex = /\{([^\}]+)\}/g,
		objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g,
		
		replacer = function(all, key, obj) {
			var res = obj;
			key.replace(objNotationRegex,
			function(all, name, quote, quotedName, isFunc) {
				name = name || quotedName;
				if (res) {
					if (name in res) {
						res = res[name];
					}
					return (typeof res == "function") && isFunc && (res = res());
				}
			});
			res = (res === null || res == obj ? all: res) + "";
			return res;
		},
		
		fill = function(str, obj) {
			return String(str).replace(tokenRegex,
			function(all, key) {
				return replacer(all, key, obj);
			});
		},
		
		r = 5,
		bb = set.getBBox(),
		w = Math.round(bb.width),
		h = Math.round(bb.height),
		x = Math.round(bb.x) - r,
		y = Math.round(bb.y) - r,
		gap = Math.min(h / 2, w / 2, 10),
		shapes = {
			top: "M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}l-{right},0-{gap},{gap}-{gap}-{gap}-{left},0a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z",
			bottom: "M{x},{y}l{left},0,{gap}-{gap},{gap},{gap},{right},0a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z",
			right: "M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}v{h4},{h4},{h4},{h4}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}l0-{bottom}-{gap}-{gap},{gap}-{gap},0-{top}a{r},{r},0,0,1,{r}-{r}z",
			left: "M{x},{y}h{w4},{w4},{w4},{w4}a{r},{r},0,0,1,{r},{r}l0,{top},{gap},{gap}-{gap},{gap},0,{bottom}a{r},{r},0,0,1,-{r},{r}h-{w4}-{w4}-{w4}-{w4}a{r},{r},0,0,1-{r}-{r}v-{h4}-{h4}-{h4}-{h4}a{r},{r},0,0,1,{r}-{r}z"
		},
		offset = {
			hx0: X - (x + r + w - gap * 2),
			hx1: X - (x + r + w / 2 - gap),
			hx2: X - (x + r + gap),
			vhy: Y - (y + r + h + r + gap),
			"^hy": Y - (y - gap)
		},
		mask = [{
			x: x + r,
			y: y,
			w: w,
			w4: w / 4,
			h4: h / 4,
			right: 0,
			left: w - gap * 2,
			bottom: 0,
			top: h - gap * 2,
			r: r,
			h: h,
			gap: gap
		},
		{
			x: x + r,
			y: y,
			w: w,
			w4: w / 4,
			h4: h / 4,
			left: w / 2 - gap,
			right: w / 2 - gap,
			top: h / 2 - gap,
			bottom: h / 2 - gap,
			r: r,
			h: h,
			gap: gap
		},
		{
			x: x + r,
			y: y,
			w: w,
			w4: w / 4,
			h4: h / 4,
			left: 0,
			right: w - gap * 2,
			top: 0,
			bottom: h - gap * 2,
			r: r,
			h: h,
			gap: gap
		}][pos_x == "middle" ? 1: (pos_x == "top" || pos_x == "left") * 2],
		dx = 0,
		dy = 0,
		out = this.path(fill(shapes[pos[0]], mask)).insertBefore(set);
		
	switch (pos[0]) {
		case "top":
			dx = X - (x + r + mask.left + gap);
			dy = Y - (y + r + h + r + gap);
			break;
		case "bottom":
			dx = X - (x + r + mask.left + gap);
			dy = Y - (y - gap);
			break;
		case "left":
			dx = X - (x + r + w + r + gap);
			dy = Y - (y + r + mask.top + gap);
			break;
		case "right":
			dx = X - (x - gap);
			dy = Y - (y + r + mask.top + gap);
			break;
	}
	out.translate(dx, dy);
	if (ret) {
		ret = out.attr("path");
		out.remove();
		return {
			path: ret,
			dx: dx,
			dy: dy
		};
	}
	set.translate(dx, dy);
	return out;
};


})();