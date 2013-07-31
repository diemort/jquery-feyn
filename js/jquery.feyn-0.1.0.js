/* jQuery.Feyn.js, version 0.1.0, MIT License
 * Plugin for drawing Feynman diagrams with SVG
 *
 * Author: Zan Pan <panzan89@gmail.com>
 * Date: 2013-6-24
 *
 * Useage: $(container).feyn(options);
*/

;(function($) {
'use strict';

// Add method to jQuery prototype
$.fn.feyn = function(options) {

  // Iterate over the current set of matched elements
  return this.each(function() {

    // Return early if this element already has an instance
    if($(this).data('feyn')) {
      return;
    }

    // Create an Feyn instance
    try {
      $(this).html(new Feyn(this, options).svgOutput());
      $(this).data('feyn', true);
    } catch(e) {
      $(this).html('JavaScript ' + e.name + ': ' + e.message);
    }

  });

};

// Create Feyn object as a constructor
var Feyn = function(container, options) {

  // Count instances
  Feyn.counter = (Feyn.counter || 0) + 1;
  Feyn.prefix = 'feyn' + (Feyn.counter > 1 ? Feyn.counter : '');

  // Merge options with defaults
  var opts = $.extend(true, {
    xmlns: 'http://www.w3.org/2000/svg',
    xlink: 'http://www.w3.org/1999/xlink',
    version: '1.1',
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    title: '',
    description: 'Feynman diagram generated by jQuery.Feyn',
    standalone: false,
    selector: false,
    grid: {show: false, unit: 20},
    color: 'black',
    thickness: 1.6,
    tension: 1,
    ratio: 1,
    incoming: {},
    outgoing: {},
    vertex: {},
    auxiliary: {},
    fermion: {arrow: true},
    photon: {clockwise: false, period: 5, amplitude: 5},
    scalar: {arrow: false, dash: '5 5', offset: 2},
    ghost: {arrow: true, thickness: 3, dotsep: 8, offset: 5},
    gluon: {clockwise: false, width: 15, height: 15, factor: 0.75,
      percent: 0.6, scale: 1.15},
    symbol: {},
    node: {show: false, thickness: 1, radius: 3, type: 'dot', fill: 'white'},
    label: {family: 'serif', size: 15, face: 'italic'},
    image: {},
    ajax: false
  }, options);

  // Constants
  var PI = Math.PI;

  // Style of propagator for different particles
  var all = {color: opts.color, thickness: opts.thickness},
    sty = {fermion: {},
      photon: {fill: 'none'},
      scalar: {dash: opts.scalar.dash, offset: opts.scalar.offset},
      ghost: {dash: '0.1 ' + opts.ghost.dotsep, offset: opts.ghost.offset},
      gluon: {fill: 'none'}};
  for(var key in sty) {
    sty[key] = $.extend(true, {}, all, {color: opts[key].color,
      thickness: opts[key].thickness, linecap: 'round'}, sty[key]);
  }

  // Nodes for Feynman diagram
  var nd = $.extend({}, opts.incoming, opts.outgoing, opts.vertex,
    opts.auxiliary);
  for(key in nd) {
    nd[key] = nd[key].replace(/\s/g, '').split(',');
  }

  // Edges for Feynman diagram
  var fd = {fermion: {}, photon: {}, scalar: {}, ghost: {}, gluon: {}};
  for(var par in fd) {
    fd[par] = $.extend({}, opts[par]);
    for(key in fd[par]) {
      if(!key.match(/line|arc|loop/)) {
        delete fd[par][key];
      } else {
        fd[par][key] = fd[par][key].replace(/\s/g, '').split(',');
        for(var ind in fd[par][key]) {
          fd[par][key][ind] = fd[par][key][ind].replace(/-+/g, '-').split('-');
        }
      }
    }
  }

  // Style for labels
  var lb = {sty: {color: opts.label.color || all.color,
    thickness: opts.label.thickness || 0,
    fill: opts.label.fill || opts.label.color || all.color,
    family: opts.label.family, size: opts.label.size,
    weight: opts.label.weight, face: opts.label.face,
    align: opts.label.align || 'middle'}, pos: opts.label};
  for(key in lb.pos) {
    if(lb.sty[key]) {
      delete lb.pos[key];
    }
  }

  // Collector for SVG elements
  var svg = {defs: [], body: [],
    tags: ['line', 'rect', 'circle', 'ellipse', 'path', 'polyline',
      'polygon', 'image', 'use'],
    attr: {xlink: 'xmlns:xlink', href: 'xlink:href',
      color: 'stroke', thickness: 'stroke-width',
      dash: 'stroke-dasharray', linecap: 'stroke-linecap',
      linejoin: 'stroke-linejoin', offset: 'stroke-dashoffset',
      family: 'font-family', size: 'font-size', face: 'font-style',
      weight: 'font-weight', align: 'text-anchor'}};

  // Create SVG element
  var svgElem = function(elem, attr, sty, child) {
    var str = '';
    attr = $.extend({}, attr, sty);
    for(var key in attr) {
      str += ' ' + (svg.attr[key] || key) + '="' + attr[key] + '"';
    }
    return '<' + elem + str + (svg.tags.indexOf(elem) >= 0 ? '/>' :
      '>' + (elem.match(/title|desc|tspan/) ? '': '\n') + (child ?
      child.replace(/</g, '  <').replace(/\s+<\/(title|desc|tspan)/g, '</$1') :
      '') + '</' + elem + '>') + '\n';
  };

  // Convert float number to string
  var numStr = function() {
    var str = '';
    for(var i = 0, l = arguments.length, item; i < l; i++) {
      item = arguments[i];
      str += (typeof item !== 'number' ? item :
        item.toFixed(3).replace(/(.\d*?)0+$/, '$1').replace(/\.$/, ''));
    }
    return str;
  };

  // Set id for SVG elements
  var setId = function(name) {
    return opts.selector ? {id: Feyn.prefix + '_' + name} : {};
  };

  // Set class for group
  var setClass = function(name) {
    return opts.selector ? {'class': name} : {};
  };

  // Transform coordinate system
  var axisTrans = function(sx, sy, ex, ey) {
    var dx = ex - sx,
      dy = ey - sy;
    return {angle: Math.atan2(dy, dx),
      distance: Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))};
  };

  // Set transformation
  var setTrans = function(x, y, angle) {
    return 'translate(' + numStr(x, ',', y) + ')' +
      (angle ? ' rotate(' + numStr(angle * 180 / PI) + ')' : '');
  };

  // Get control points
  var getPoints = function(sx, sy, ex, ey, x, y) {
    var ang = Math.atan2(ey - sy, ex - sx);
    return numStr(x * Math.cos(ang) - y * Math.sin(ang) + sx, ',',
      x * Math.sin(ang) + y * Math.cos(ang) + sy);
  };

  // Set arrows
  var setArrow = function(par, x, y, angle, name) {
    var t = (par == 'ghost' ? sty.fermion.thickness : sty[par].thickness);
    return opts[par].arrow ? svgElem('polygon', $.extend({points:
      numStr('0,0 ', -2 * t, ',', 2.5 * t, ' ', 3 * t, ',0 ', -2 * t, ',',
      -2.5 * t)}, {transform: setTrans(x, y, angle)}), setId(name)) : '';
  };

  // Get path for photon and gluon line
  var linePath = function(tile, period, distance) {
    var bezier = ['M'],
      num = Math.floor(distance / period),
      extra = distance - period * num + 0.1;
    for(var n = 0; n <= num; n++) {
      for(var i = 0, l = tile.length, item; i < l; i++) {
        item = tile[i];
        if($.isArray(item)) {
          if(n < num || item[0] < extra) {
            bezier.push(numStr(item[0] + period * n, ',', item[1]));
          } else {
            break;
          }
        } else {
          bezier.push(item);
        }
      }
    }
    return bezier.join(' ').replace(/\s[A-Z][^A-Z]*$/, '');
  };

  // Get path for photon and gluon arc
  var arcPath = function(par, tile, period, distance) {
    var t = 0.25 * Math.max(opts[par].tension || opts.tension, 2),
      phi = Math.acos(-0.5 / t),
      theta = -2 * Math.asin(period / (t * distance)),
      segment = [],
      bezier = ['M', '0,0'];
    for(var n = 0; n <= (PI - 2 * phi) / theta; n++) {
      segment.push([distance * (t * Math.cos(theta * n + phi) + 0.5),
        distance * (t * Math.sin(theta * n + phi) - Math.sqrt(t * t - 0.25))]);
    }
    for(var i = 0, l = segment.length - 1, model; i < l; i++) {
      model = (par == 'photon' ? tile[i % 2] : tile);
      for(var j = 0, m = model.length, item; j < m; j++) {
        item = model[j];
        bezier.push($.isArray(item) ? getPoints(segment[i][0], segment[i][1],
          segment[i+1][0], segment[i+1][1], item[0], item[1]) : item);
      }
    }
    return bezier.join(' ').replace(/\s[A-Z]$/, '');
  };

  // Get path for photon and gluon loop
  var loopPath = function(par, tile, period, distance) {
    var theta = 2 * Math.asin(2 * period / distance),
      num = 2 * PI / theta,
      segment = [],
      lift = (opts[par].clockwise ? -0.5 : 0.5),
      bezier = ['M', (par == 'gluon' ? lift + ',0' : '0,' + lift)];
    for(var x = -0.1, dis = distance; Math.floor(num) % 4 ||
      num - Math.floor(num) > 0.1; x += 0.001) {
      distance = (1 + x) * dis;
      theta = 2 * Math.asin(2 * period / distance);
      num = 2 * PI / theta;
    }
    for(var n = 0; n <= num; n++) {
      segment.push([0.5 * distance * (1 - Math.cos(theta * n)),
        0.5 * distance * Math.sin(theta * n)]);
    }
    for(var i = 0, l = segment.length - 1, model; i < l; i++) {
      model = (par == 'photon' ? tile[i % 2] : tile);
      for(var j = 0, m = model.length, item; j < m; j++) {
        item = model[j];
        bezier.push($.isArray(item) ? getPoints(segment[i][0], segment[i][1],
          segment[i+1][0], segment[i+1][1], item[0], item[1]) : item);
      }
    }
    return bezier.join(' ').replace(/\s[A-Z]$/, '') + ' Z';
  };

  // Get path for photon propagator
  var photonPath = function(distance, shape) {
    var a = opts.photon.amplitude,
      p = opts.photon.period,
      pts = (opts.photon.clockwise ?
        [[0, 0], 'C', [2, -PI * a / p], [p - 2, -a], [p, -a],
          'S', [2 * p - 2, -PI * a / p], [2 * p, 0], 'S', [3 * p - 2, a],
          [3 * p, a], 'S', [4 * p - 2, PI * a / p]] :
        [[0, 0], 'C', [2, PI * a / p], [p - 2, a], [p, a],
          'S', [2 * p - 2, PI * a / p], [2 * p, 0], 'S', [3 * p - 2, -a],
          [3 * p, -a], 'S', [4 * p - 2, -PI * a / p]]),
      tile = (opts.photon.clockwise ? 
        [['C', [2, -PI * a / p], [p - 2, -a], [p, -a],
          'S', [2 * p - 2, -PI * a / p], [2 * p + 0.5, 0]],
          ['C', [2, PI * a / p], [p - 2, a], [p, a],
          'S', [2 * p - 2, PI * a / p], [2 * p - 0.5, 0]]] :
        [['C', [2, PI * a / p], [p - 2, a], [p, a],
          'S', [2 * p - 2, PI * a / p], [2 * p - 0.5, 0]],
          ['C', [2, -PI * a / p], [p - 2, -a], [p, -a],
          'S', [2 * p - 2, -PI * a / p], [2 * p + 0.5, 0]]]);
    return {line: linePath(pts, 4 * p, distance),
      arc: arcPath('photon', tile, p, distance),
      loop: loopPath('photon', tile, p, distance)}[shape];
  };

  // Get path for gluon propagator
  var gluonPath = function(distance, shape) {
    var kappa = 4 * (Math.SQRT2 - 1) / 3,
     a = opts.gluon.height * opts.gluon.factor,
     b = opts.gluon.width * opts.gluon.percent,
     c = opts.gluon.height * (opts.gluon.factor - 0.5),
     d = opts.gluon.width * (1 - opts.gluon.percent),
     pts = (opts.gluon.clockwise ?
       [[0,0], 'A ' + a + ' ' + b, 0, 0, 1, [a, b], 'A ' + c + ' ' + d,
         0, 1, 1, [a - 2 * c, b], 'A ' + a + ' ' + b, 0, 0, 1] :
       [[0,0], 'A ' + a + ' ' + b, 0, 0, 0, [a, -b], 'A ' + c + ' ' + d,
         0, 1, 0, [a - 2 * c, -b], 'A ' + a + ' ' + b, 0, 0, 0]);
   a = (opts.gluon.clockwise ? a : opts.gluon.scale * a);
   var lift = a / Math.pow(distance, 0.6),
     tile = (opts.gluon.clockwise ?
       ['C', [kappa * a, lift], [a, b - kappa * b], [a, b],
         'C', [a, b + kappa * d], [a - c + kappa * c, b + d], [a - c, b + d],
         'S', [a - 2 * c, b + kappa * d], [a - 2 * c, b],
         'C', [a - 2 * c, b - kappa * b], [2 * (a - c) - kappa * a, 0],
         [2 * (a - c), -lift]] :
       ['C', [kappa * a, lift], [a, -b + kappa * b], [a, -b],
         'C', [a, -b - kappa * d], [a - c + kappa * c, -b - d], [a - c, -b - d],
         'S', [a - 2 * c, -b - kappa * d], [a - 2 * c, -b],
         'C', [a - 2 * c, -b + kappa * b], [2 * (a - c) - kappa * a, 0],
         [2 * (a - c), -lift]]);
    return {line: linePath(pts, opts.gluon.height, distance),
      arc: arcPath('gluon', tile, a - c, distance),
      loop: loopPath('gluon', tile, a - c, distance)}[shape];
  };

  // Plot propagator line
  var plotLine = function(sx, sy, ex, ey, par, name) {
    var path = {photon: photonPath, gluon: gluonPath},
      id = setId(name + '_line'),
      axis = axisTrans(sx, sy, ex, ey);
    return par.match(/photon|gluon/) ?
      [svgElem('path', {d: path[par](axis.distance, 'line'),
        transform: setTrans(sx, sy, axis.angle)}, id), ''] :
      [svgElem('line', {x1: sx, y1: sy, x2: ex, y2: ey}, id),
        setArrow(par, 0.5 * (sx + ex), 0.5 * (sy + ey), axis.angle,
          name + '_line_arrow')];
  };

  // Plot propagator arc
  var plotArc = function(sx, sy, ex, ey, par, name) {
    var path = {photon: photonPath, gluon: gluonPath},
      id = setId(name + '_arc'),
      attr = $.extend({fill: 'none'}, id),
      axis = axisTrans(sx, sy, ex, ey),
      t = 0.5 * Math.max(opts[par].tension || opts.tension, 1),
      f = t - Math.sqrt(Math.abs(t * t - 0.25)),
      w = axis.distance,
      hx = f * w * Math.sin(axis.angle),
      hy = f * w * Math.cos(axis.angle);
    return par.match(/photon|gluon/) ?
      [svgElem('path', {d: path[par](axis.distance, 'arc'),
        transform: setTrans(sx, sy, axis.angle)}, id), ''] :
      [svgElem('path', {d: numStr('M 0,0 A ', t * w, ' ', t * w,
        ' 0 0 1 ', w, ',0'), transform: setTrans(sx, sy, axis.angle)}, attr),
        setArrow(par, 0.5 * (sx + ex) + hx, 0.5 * (sy + ey) - hy,
          axis.angle, name + '_arc_arrow')];
  };

  // Plot propagator loop
  var plotLoop = function(sx, sy, ex, ey, par, name) {
    var path = {photon: photonPath, gluon: gluonPath},
      id = setId(name + '_loop'),
      attr = $.extend({fill: 'none'}, id),
      axis = axisTrans(sx, sy, ex, ey),
      ratio = opts[par].ratio || opts.ratio,
      w = 0.5 * axis.distance,
      hx = ratio * w * Math.sin(axis.angle),
      hy = ratio * w * Math.cos(axis.angle);
    return par.match(/photon|gluon/) ?
      [svgElem('path', {d: path[par](axis.distance, 'loop'),
        transform: setTrans(sx, sy, axis.angle)}, id), ''] :
      [svgElem('ellipse', {cx: numStr(w), cy: 0, rx: numStr(w),
        ry: numStr(ratio * w), transform: setTrans(sx, sy, axis.angle)}, attr),
        setArrow(par, 0.5 * (sx + ex) + hx, 0.5 * (sy + ey) - hy, axis.angle,
          name + '_loop_arrow_1') + setArrow(par, 0.5 * (sx + ex) - hx,
          0.5 * (sy + ey) + hy, PI + axis.angle, name + '_loop_arrow_2')];
  };

  // Set graph edges
  var setEdge = function() {
    var elems = [],
      edge = [],
      pts = [],
      funcs = {line: plotLine, arc: plotArc, loop: plotLoop};
    for(var par in fd) {
      var group = [],
        shape = '',
        arrow = '';
      for(var key in fd[par]) {
        for(var ind in fd[par][key]) {
          edge = fd[par][key][ind];
          pts[0] = nd[edge[0]];
          for(var i = 1, l = edge.length; i < l; i++) {
            pts[i] = nd[edge[i]];
            group = funcs[key](+pts[i-1][0], +pts[i-1][1], +pts[i][0],
              +pts[i][1], par, edge[i-1] + '_' + edge[i]);
            shape += group[0];
            arrow += group[1];
          }
        }
      }
      elems.push(shape ? svgElem('g', setClass(par), sty[par], shape +
        (opts[par].arrow ? svgElem('g', setClass(par + '_' + 'arrow'),
        {thickness: 0, fill: sty[par].color}, arrow) : '')) : '');
    }
    return elems.join('');
  };

  // Set symbols
  var setSymbol = function() {
    var style = $.extend({}, all, {color: opts.symbol.color,
      thickness: opts.symbol.thickness, fill: 'none'}),
      t = style.thickness,
      group = '';
    delete opts.symbol.color;
    delete opts.symbol.thickness;
    for(var key in opts.symbol) {
      var item = opts.symbol[key],
        coord = nd[item[0]] || item[0].replace(/\s/g, '').split(','),
        trans = {transform: setTrans(coord[0], coord[1], item[1] * PI / 180)},
        type = item[2][0],
        p = item[2][1],
        dis = item[3],
        id = setId(key + '_' + type),
        pts = ['0,0'];
      if(type == 'zigzag') {
        for(var i = 0; i <= 0.5 * dis / p; i++) {
          pts.push(numStr(p * (2 * i + 1), ',', (opts.tension + 0.2) *
            p * (1 - 2 * (i % 2))), numStr(2 * p * (i + 1), ',0'));
        }
      } 
      group += {'zigzag': svgElem('polyline',
          $.extend({points: pts.join(' ')}, trans), $.extend({}, style, id)),
        arrow: svgElem('g', trans, id, svgElem('path',
          {d: (p > dis ? numStr('M 0,0 A ', p, ' ', p, ' 0 0 1 ', dis, ',0') :
          numStr('M 0,0 L ', dis, ',0'))}, style) + svgElem('polygon',
            {points: numStr(dis, ',0 ', dis - 2 * t, ',', 2.5 * t, ' ',
            dis + 3 * t, ',0 ', dis - 2 * t, ',', -2.5 * t)},
            {thickness: 0, fill: style.color})),
        hadron: svgElem('g', trans, $.extend({}, style, id), svgElem('path',
          {d: numStr('M 0,0 L ', dis, ',0', ' M 0,', p, ' L ', dis, ',', p,
          ' M 0,', -p, ' L ', dis, ',', -p)}, {}) + svgElem('polygon',
          {points: numStr(dis, ',', 2 * p, ' ', dis + 3.5 * p, ',0 ', dis,
          ',', -2 * p)}, {fill: 'white'})),
        bubble: svgElem('path', $.extend({d: numStr('M 0,0 C ', p, ',', p,
          ' ', dis, ',', p, ' ', dis, ',0 S ', p, ',', -p, ' ', ' 0,0 Z')},
          trans), $.extend({}, style, id))}[type];
    }
    return group ? svgElem('g', setClass('symbol'), all, group) : '';
  };

  // Set graph nodes
  var setNode = function() {
    var show = (opts.node.show === true ? 'iova' : opts.node.show),
      type = opts.node.type,
      style = $.extend({}, all, {color: opts.node.color,
        thickness: opts.node.thickness, fill: opts.node.fill}),
      nr = opts.node.radius + style.thickness,
      a = nr / Math.SQRT2,
      cross = numStr('M ', -a, ',', -a, ' L ', a, ',', a,
        ' M ', -a, ',', a, ' L ', a, ',', -a),
      group = '';
    for(var key in nd) {
      if(show.indexOf(key.charAt(0)) >= 0) {
        var id = setId(key + '_' + type),
          x = +nd[key][0],
          y = +nd[key][1];
        group += {dot: svgElem('circle', {cx: x, cy: y, r: nr}, id), otimes:
          svgElem('g', {}, id, svgElem('circle', {cx: x, cy: y, r: nr}) +
          svgElem('path', {d: cross, transform: setTrans(x, y, 0)}))}[type];
      }
    }
    return group ? svgElem('g', setClass('node'), style, group) : '';
  };

  // Format label string
  var formatStr = function(str) {
    str = str.replace(/[\s\{\}]+/g, '').replace(/(_[^_]+)(\^[^\^]+)/g, '$2$1');
    var font = lb.sty.size,
      small = Math.round(0.8 * font),
      head = str.charAt(0),
      sup = str.indexOf('^') + 1,
      sub = str.indexOf('_') + 1,
      ind = (sup ? sup : sub),
      hx = -0.15 * font,
      vy = 0.4 * font,
      content = '';
    content += (head.match(/-|~/) ? svgElem('tspan', {dx: numStr('0 ', 4 * hx),
      dy: numStr(-vy, ' ', vy)}, {}, (head == '-' ? '&#8211;' : head) +
      (ind ? str.slice(1, ind - 1) : str.slice(1))) :
      svgElem('tspan', {}, {}, (ind ? str.slice(0, ind - 1) : str.slice(0))));
    content += (sup ? svgElem('tspan', {dx: numStr(hx), dy: numStr(-vy)},
      {size: small}, (sub ? str.slice(sup, sub - 1) : str.slice(sup))) : '');
    content += (sub ? svgElem('tspan', {dx: numStr((sup ? 5 : 1) * hx),
      dy: numStr((sup ? 2 : 1) * vy)}, {size: small}, str.slice(sub)) : '');
    return content;
  };

  // Set annotation labels
  var setLabel = function() {
    var group = '';
    for(var key in lb.pos) {
      var item = lb.pos[key],
        coord = nd[item[0]] || item[0].replace(/\s/g, '').split(',');
      group += svgElem('text', {x: numStr(coord[0]), y: numStr(coord[1])},
        setId(key), formatStr(item[1]));
    }
    return group ? svgElem('g', setClass('label'), lb.sty, group) : '';
  };

  // Set annotation images
  var setImage = function() {
    var group = '';
    for(var key in opts.image) {
      var item = opts.image[key],
        coord = nd[item[0]] || item[0].replace(/\s/g, '').split(','),
        x = numStr(coord[0]),
        y = numStr(coord[1]),
        id = setId(key);
      if(opts.ajax) {
        $.ajax({url: item[1], dataType: 'text', async: false,
          success: function(data) { 
            data = data.replace(/<\?.*\?>\n*/, '');
            data = data.slice(0, data.search('>')).replace(/ x=.\d+./, '')
              .replace(/ y=.\d+./, '') + data.slice(data.search('>'));
            group += data.replace(/>/, ' x="' + x + '" y="' + y + '">')
              .replace(/(id=.)/g, '$1' + id.id + '_')
              .replace(/(href=.#)/g, '$1' + id.id + '_');
          }, error: function() {
            throw new Error('fail to load ' + item[1]);
          }
        });
      } else {
        group += svgElem('image', {href: item[1], x: x, y: y},
          $.extend({width: item[2] || 32, height: item[3] || 32},
          (item[3] ? {} : {preserveAspectRatio: 'xMinYMin meet'}), id));
      }
    }
    return group ? svgElem('g', setClass('image'), {}, group) : '';
  };

  // Generate SVG output
  this.svgOutput = function() {

    // Detect SVG support
    if(!(document.createElementNS &&
      document.createElementNS(opts.xmlns, 'svg').createSVGRect)) {
      return 'Your browser does not support SVG.';
    }

    // Show SVG grids
    if(opts.grid.show) {
      var u = opts.grid.unit;
      svg.defs.push(svgElem('pattern', {x: 0, y: 0, width: u, height: u,
        viewBox: '0 0 ' + u + ' ' + u}, {patternUnits: 'userSpaceOnUse',
        id: Feyn.prefix + '_grid'}, svgElem('polyline', {points:
        u + ',0 0,0 0,' + u}, {color: 'silver', fill: 'none'})));
      svg.body.push(svgElem('rect', {x: 0, y: 0, width: '100%', height: '100%'},
        {color: 'silver', fill: 'url(#' + Feyn.prefix + '_grid)'}));
    }

    // Show graph edges and symbols
    svg.body.push(setEdge() + setSymbol());

    // Show graph nodes
    if(opts.node.show) {
      svg.body.push(setNode());
    }

    // Show labels and images
    svg.body.push(setLabel() + setImage());

    // Generate SVG source code
    var src = svgElem('svg', {xmlns: opts.xmlns, xlink: opts.xlink,
      version: opts.version, x: opts.x, y: opts.y,
      width: opts.width, height: opts.height},
      (opts.selector ? {id: Feyn.prefix} : {}),
      (opts.title ? svgElem('title', {}, {}, opts.title) : '') +
      (opts.description ? svgElem('desc', {}, {}, opts.description) : '') +
      (svg.defs.length ? svgElem('defs', {}, {}, svg.defs.join('')) : '') +
      (svg.body.length ? svg.body.join('') : ''));

    // Get standalone SVG
    if(opts.standalone) {
      var code = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"' +
        ' "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n'+ src;
      src = '<div class="feyn" style="display:inline-block;margin-right:' +
        '5px;">' + src + '</div><textarea cols="80" spellcheck="false"' +
        ' style="padding:3px;height:' + (opts.height - 8) + 'px;">' +
        code.replace(/&/g, '&#38;').replace(/"(.+?)"/g, "&#34;$1&#34;")
        .replace(/</g, '&#60;').replace(/>/g, '&#62;') + '</textarea>';
      $(container).change(function() {
        src = $(this).children('textarea').val();
        $(this).children('.feyn').html(src.slice(src.search('<svg')));
      });
    }

    return src;
  };

};

})(jQuery);
