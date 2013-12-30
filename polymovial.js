function polymovial(element, capa, degree, tolerance, matf) {
    this.matf = matf;
    this.capacity = this.p2(capa);
    this.degree = degree;
    this.tolerance = tolerance;
    this.points = new Array(this.capacity);
    for (i = 0; i < this.capacity; i++) {
        this.points[i] = new Pair(0, 0);
    }

    this.index = 0;
    this.ob = document.getElementById(element);
    this.rect = this.ob.getBoundingClientRect();
    this.ob.polymovial = this;
    this.ob.onmousemove = function(event) {
        var p = new Pair(event.x + this.polymovial.rect.left, event.y + this.polymovial.rect.top);
        this.polymovial.points[this.polymovial.index &
                               (this.polymovial.capacity) - 1] = p;
        this.polymovial.index++;
    };
};

polymovial.prototype.p2 = function(v) {
    v--;
    v |= v >> 1;
    v |= v >> 2;
    v |= v >> 4;
    v |= v >> 8;
    v |= v >> 16;
    v++;

    return v;
};

polymovial.prototype.obtainPolynomial = function() {
    return this.matf.process_data(this.points, this.degree);
};

polymovial.prototype.calcZeros = function(poly, y) {
    var degreePar = new Object();

    degreePar.Degree = this.degree;
    var p = new Array(poly.length);
    for (i = 0; i < poly.length; i++) {
        p[i] = poly[i];
    }

    p[p.length - 1] -= y;
    var zeror = new Array(this.degree);
    var zeroi = new Array(this.degree);

    for (var i = 0; i < this.degree; i++) {
        zeroi[i] = zeror[i] = 0;
    }

    rpSolve(degreePar, p, zeror, zeroi);
    var ret = new Array();
    for (i = 0; i < zeroi.length; i++) {
        if (zeroi[i] == 0) {
            ret.push(zeror[i]);
        }
    }

    return ret;
};

polymovial.prototype.testHSegment = function(r, x1, x2) {
    if (r.length == 0) {
        return false;
    }

    for (i = 0; i < r.length; i++) {
        if (r[i] >= x1 + this.tolerance &&
            r[i] <= x2 - this.tolerance) {
            return true;
        }
    }

    return false;
};

polymovial.prototype.testVSegment = function(r, y1, y2) {
    if (r >= y1 + this.tolerance &&
        r <= y2 - this.tolerance) {
        return true;
    }

    return false;
};

/*
Check if the curve crosses / touches rectangular's boundaries.
Rect's side after side is being checked. For every side, we first
test if the curve generally crosses / touches the line drawn from the segment
representing the side. Next, we check if any of these points is within
the segment.
*/
polymovial.prototype.checkIntersection = function(element, poly) {
    var rect = document.getElementById(element).getBoundingClientRect();
    var res = Object();
    var revertedPoly = new Array(poly[0].length);
    var l = revertedPoly.length - 1;
    for (i = 0, j = l; i < l + 1; i++, j--) {
        revertedPoly[j] = poly[0][i];
    }

    var rt = this.calcZeros(revertedPoly, rect.top);
    if (this.testHSegment(rt, rect.left, rect.right)) {
        return true;
    }

    var rb = this.calcZeros(revertedPoly, rect.bottom);
    if (this.testHSegment(rb, rect.left, rect.right)) {
        return true;
    }

    var rl = this.matf.regress(rect.left, poly[0]);
    if (this.testVSegment(rl, rect.top, rect.bottom)) {
        return true;
    }

    var rr = this.matf.regress(rect.right, poly[0]);
    if (this.testVSegment(rr, rect.top, rect.bottom)) {
        return true;
    }

    return false;
};
