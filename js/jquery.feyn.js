// jQuery.Feyn v0.2.5 | (c) 2013 Zan Pan, MIT license
!function(a){"use strict";a.fn.feyn=function(c){return this.each(function(){if(!a(this).data("feyn"))try{a(this).html(new b(this,c).output()),a(this).data("feyn",!0)}catch(d){a(this).html("JavaScript "+d.name+": "+d.message)}})};var b=function(c,d){b.counter=(b.counter||0)+1,b.prefix="feyn"+(b.counter>1?b.counter:"");var e=a.extend(!0,{xmlns:"http://www.w3.org/2000/svg",xlink:"http://www.w3.org/1999/xlink",version:"1.1",x:0,y:0,width:200,height:200,title:"",description:"Feynman diagram generated by jQuery.Feyn",standalone:!1,selector:!1,grid:{show:!1,unit:20},color:"black",thickness:1.6,tension:1,ratio:1,clockwise:!1,incoming:{},outgoing:{},vertex:{},auxiliary:{},fermion:{arrow:!0},photon:{period:5,amplitude:5},scalar:{arrow:!1,dash:"5 5",offset:2},ghost:{arrow:!0,thickness:3,dotsep:8,offset:5},gluon:{width:15,height:15,factor:.75,percent:.6,scale:1.15},symbol:{},node:{show:!1,thickness:1,type:"dot",radius:3,fill:"white"},label:{family:"Georgia",size:15,face:"italic"},image:{},mathjax:!1,ajax:!1},d),f=Math.PI,g={fill:"none",color:e.color,thickness:e.thickness},h={fermion:{},photon:{},gluon:{},scalar:{dash:e.scalar.dash,offset:e.scalar.offset},ghost:{dash:"0.1 "+e.ghost.dotsep,offset:e.ghost.offset}};for(var i in h)h[i]=a.extend(!0,{},g,{color:e[i].color,thickness:e[i].thickness,linecap:"round"},h[i]);var j=a.extend({},e.incoming,e.outgoing,e.vertex,e.auxiliary);for(i in j)j[i]=j[i].replace(/\s/g,",").split(/,+/,2);var k={fermion:{},photon:{},scalar:{},ghost:{},gluon:{}};for(var l in k){k[l]=a.extend({},e[l]);for(i in k[l])if(i.match(/line|arc|loop/)){k[l][i]=k[l][i].replace(/\s/g,"").split(",");for(var m in k[l][i])k[l][i][m]=k[l][i][m].replace(/-+/g,"-").split("-")}else delete k[l][i]}var n={sty:{fill:e.label.fill||e.label.color||g.color,color:e.label.color||g.color,thickness:e.label.thickness||0,family:e.label.family,size:e.label.size,weight:e.label.weight,face:e.label.face,align:e.label.align||"middle"},pos:e.label};for(i in n.pos)n.sty[i]&&delete n.pos[i];var o={defs:[],body:[],tags:["path","line","rect","circle","ellipse","polygon","polyline","image","use"],attr:{xlink:"xmlns:xlink",href:"xlink:href",color:"stroke",thickness:"stroke-width",dash:"stroke-dasharray",linecap:"stroke-linecap",linejoin:"stroke-linejoin",offset:"stroke-dashoffset",family:"font-family",size:"font-size",face:"font-style",weight:"font-weight",align:"text-anchor"}},p=function(b,c,d,e){var f="";c=a.extend({},c,d);for(var g in c)f+=" "+(o.attr[g]||g)+'="'+c[g]+'"';return"<"+b+f+(o.tags.indexOf(b)>=0?"/>":">"+(b.match(/title|desc|tspan|body/)?"":"\n")+(e?e.replace(/</g,"  <").replace(/\s+<\/(title|desc|tspan|body)/g,"</$1"):"")+"</"+b+">")+"\n"},q=function(){for(var e,b="",c=0,d=arguments.length;d>c;c++)e=arguments[c],b+=" "+("number"!=typeof e?e:e.toFixed(3).replace(/(.\d*?)0+$/,"$1").replace(/\.$/,""));return a.trim(b).replace(/ ?, ?/g,",")},r=function(a,b,c,d){var e=c-a,f=d-b;return{angle:Math.atan2(f,e),distance:Math.sqrt(e*e+f*f)}},s=function(a,b,c){return"translate("+q(a,",",b)+")"+(c?" rotate("+q(180*c/f)+")":"")},t=function(a,b,c,d,e,f){var g=Math.atan2(d-b,c-a);return q(e*Math.cos(g)-f*Math.sin(g)+a,",",e*Math.sin(g)+f*Math.cos(g)+b)},u=function(a){return j[a]||a.replace(/\s/g,",").split(/,+/,2)},v=function(a){return e.selector?{id:b.prefix+"_"+a}:{}},w=function(a){return e.selector?{"class":a}:{}},x=function(b,c,d,f,g){var i=2*("ghost"==b?h.fermion.thickness:h[b].thickness);return e[b].arrow?p("polygon",a.extend({points:q("0,0",-i,",",1.25*i,1.5*i,",0",-i,",",-1.25*i)},{transform:s(c,d,f)}),v(g)):""},y=function(b,c,d){for(var e=["M"],f=Math.floor(d/c),g=d-c*f+.1,h=0;f>=h;h++)for(var k,i=0,j=b.length;j>i;i++)if(k=b[i],a.isArray(k)){if(!(f>h||k[0]<g))break;e.push(q(k[0]+c*h,",",k[1]))}else e.push(k);return e.join(" ").replace(/\s[A-Z][^A-Z]*$/,"")},z=function(b,c,d,g){for(var h=.25*Math.max(e[b].tension||e.tension,2),i=Math.acos(-.5/h),j=-2*Math.asin(d/(h*g)),k=[],l=["M","0,0"],m=0;(f-2*i)/j>=m;m++)k.push([g*(h*Math.cos(j*m+i)+.5),g*(h*Math.sin(j*m+i)-Math.sqrt(h*h-.25))]);for(var p,n=0,o=k.length-1;o>n;n++){p="photon"==b?c[n%2]:c;for(var s,q=0,r=p.length;r>q;q++)s=p[q],l.push(a.isArray(s)?t(k[n][0],k[n][1],k[n+1][0],k[n+1][1],s[0],s[1]):s)}return l.join(" ").replace(/\s[A-Z]$/,"")},A=function(b,c,d,g){for(var h=2*Math.asin(2*d/g),i=2*f/h,j=[],k=e[b].clockwise?-.5:.5,l=["M","gluon"==b?k+",0":"0,"+k],m=-.1,n=g;Math.floor(i)%4||i-Math.floor(i)>.1;m+=.001)g=(1+m)*n,h=2*Math.asin(2*d/g),i=2*f/h;for(var o=0;i>=o;o++)j.push([.5*g*(1-Math.cos(h*o)),.5*g*Math.sin(h*o)]);for(var r,p=0,q=j.length-1;q>p;p++){r="photon"==b?c[p%2]:c;for(var v,s=0,u=r.length;u>s;s++)v=r[s],l.push(a.isArray(v)?t(j[p][0],j[p][1],j[p+1][0],j[p+1][1],v[0],v[1]):v)}return l.join(" ").replace(/\s[A-Z]$/,"")+" Z"},B=function(a,b){var c=.51128733,d=e.photon.amplitude||5,g=.5*c*d,h=e.photon.period||5,i=2*h/f,j=c*h/f,k=e.photon.clockwise||e.clockwise,l=k?[[0,0],"C",[j,-g],[i,-d],[h,-d],"S",[2*h-j,-g],[2*h,0],"S",[2*h+i,d],[3*h,d],"S",[4*h-j,g]]:[[0,0],"C",[j,g],[i,d],[h,d],"S",[2*h-j,g],[2*h,0],"S",[2*h+i,-d],[3*h,-d],"S",[4*h-j,-g]],m=k?[["C",[j,-g],[i,-d],[h,-d],"S",[2*h-j,-g],[2*h+.5,0]],["C",[j,g],[i,d],[h,d],"S",[2*h-j,-g],[2*h-.5,0]]]:[["C",[j,g],[i,d],[h,d],"S",[2*h-j,g],[2*h-.5,0]],["C",[j,-g],[i,-d],[h,-d],"S",[2*h-j,-g],[2*h+.5,0]]];return{line:y(l,4*h,a),arc:z("photon",m,h,a),loop:A("photon",m,h,a)}[b]},C=function(a,b){var c=.55191502,d=e.gluon.height*e.gluon.factor,f=e.gluon.width*e.gluon.percent,g=e.gluon.height*(e.gluon.factor-.5),h=e.gluon.width*(1-e.gluon.percent),i=e.gluon.clockwise||e.clockwise,j=i?[[0,0],"A "+d+" "+f,0,0,1,[d,f],"A "+g+" "+h,0,1,1,[d-2*g,f],"A "+d+" "+f,0,0,1]:[[0,0],"A "+d+" "+f,0,0,0,[d,-f],"A "+g+" "+h,0,1,0,[d-2*g,-f],"A "+d+" "+f,0,0,0];d=i?d:e.gluon.scale*d;var k=d/Math.pow(a,.6),l=i?["C",[c*d,k],[d,f-c*f],[d,f],"C",[d,f+c*h],[d-g+c*g,f+h],[d-g,f+h],"S",[d-2*g,f+c*h],[d-2*g,f],"C",[d-2*g,f-c*f],[2*(d-g)-c*d,0],[2*(d-g),-k]]:["C",[c*d,k],[d,-f+c*f],[d,-f],"C",[d,-f-c*h],[d-g+c*g,-f-h],[d-g,-f-h],"S",[d-2*g,-f-c*h],[d-2*g,-f],"C",[d-2*g,-f+c*f],[2*(d-g)-c*d,0],[2*(d-g),-k]];return{line:y(j,e.gluon.height,a),arc:z("gluon",l,d-g,a),loop:A("gluon",l,d-g,a)}[b]},D=function(a,b,c,d,e,f){var g={photon:B,gluon:C},h=r(a,b,c,d),i=v(f+"_line");return e.match(/photon|gluon/)?[p("path",{d:g[e](h.distance,"line"),transform:s(a,b,h.angle)},i),""]:[p("line",{x1:a,y1:b,x2:c,y2:d},i),x(e,.5*(a+c),.5*(b+d),h.angle,f+"_line_arrow")]},E=function(a,b,c,d,g,h){var i={photon:B,gluon:C},j=r(a,b,c,d),k=v(h+"_arc"),l=.5*Math.max(e[g].tension||e.tension,1),m=l-Math.sqrt(Math.abs(l*l-.25)),n=j.distance,o=j.angle,t=m*n*Math.sin(o),u=m*n*Math.cos(o),w=e[g].clockwise||e.clockwise;return g.match(/photon|gluon/)?[p("path",{d:i[g](n,"arc"),transform:s(a,b,o)},k),""]:[p("path",{d:q("M 0,0 A",l*n,l*n,"0 0 1",n,",0"),transform:s(a,b,o)},k),x(g,.5*(a+c)+t,.5*(b+d)-u,o+(w?f:0),h+"_arc_arrow")]},F=function(a,b,c,d,g,h){var i={photon:B,gluon:C},j=r(a,b,c,d),k=v(h+"_loop"),l=h+"_loop_arrow_",m=e[g].ratio||e.ratio,n=.5*j.distance,o=j.angle,t=m*n*Math.sin(o),u=m*n*Math.cos(o),w=e[g].clockwise||e.clockwise;return g.match(/photon|gluon/)?[p("path",{d:i[g](2*n,"loop"),transform:s(a,b,o)},k),""]:[p("ellipse",{cx:q(n),cy:0,rx:q(n),ry:q(m*n),transform:s(a,b,o)},k),x(g,.5*(a+c)+t,.5*(b+d)-u,o+(w?f:0),l+"1")+x(g,.5*(a+c)-t,.5*(b+d)+u,o+(w?0:f),l+"2")]},G=function(){var a=[],b=[],c=[],d={line:D,arc:E,loop:F};for(var f in k){var g=[],i="",l="";for(var m in k[f])for(var n in k[f][m]){b=k[f][m][n],c[0]=j[b[0]];for(var o=1,q=b.length;q>o;o++)c[o]=j[b[o]],g=d[m](+c[o-1][0],+c[o-1][1],+c[o][0],+c[o][1],f,b[o-1]+"_"+b[o]),i+=g[0],l+=g[1]}a.push(i?p("g",w(f),h[f],i+(e[f].arrow?p("g",w(f+"_"+"arrow"),{fill:h[f].color,thickness:0},l):"")):"")}return a.join("")},H=function(){var b=a.extend({},g,{color:e.symbol.color,thickness:e.symbol.thickness}),c=b.thickness,d=0,h="";delete e.symbol.color,delete e.symbol.thickness;for(var i in e.symbol){var j=e.symbol[i],k=u(j[0]),l={transform:s(k[0],k[1],j[1]*f/180)},m=j[2],n=j[3]||20,o=j[4]||4,r=j[5],x=v(i+"_"+m),y="0,0";if("arrow"==m)d=2*o>n?Math.sqrt(o*o-n*n/4):2*o==n?1:0;else if("zigzag"==m)for(var z=0;.5*n/o>=z;z++)y+=" "+q(o*(2*z+1),",",(e.tension+.2)*o*(1-2*(z%2)),2*o*(z+1),",0");h+={arrow:p("g",l,x,p("path",{d:d?q("M 0,0 A",o,o,"0 0 1",n,",0"):q("M 0,0 L",n,",0")})+p("polygon",{points:d?r?"0,0 "+t(0,0,-2*d*d/n,d,-2*c,2.5*c)+" "+t(0,0,-2*d*d/n,d,3*c,0)+" "+t(0,0,-2*d*d/n,d,-2*c,-2.5*c):q(n,",0")+" "+t(n,0,n+2*d*d/n,d,-2*c,2.5*c)+" "+t(n,0,n+2*d*d/n,d,3*c,0)+" "+t(n,0,n+2*d*d/n,d,-2*c,-2.5*c):q(n,",0",n-2*c,",",2.5*c,n+3*c,",0",n-2*c,",",-2.5*c)},{fill:b.color,thickness:0})),blob:r?p("path",a.extend({d:q("M",o,",",-o,"A",o,o,"0 1 0",o,",",o,"L",2*n,",",o,"A",o,o,"0 1 0",2*n,",",-o,"L",o,",",-o,"Z")},l),a.extend({fill:"silver"},x)):p("ellipse",a.extend({cx:n,cy:0,rx:n,ry:o},l),a.extend({fill:"silver"},x)),bubble:p("path",a.extend({d:q("M 0,0 C",o,",",o,n,",",o,n,",0 S",o,",",-o,"0,0 Z")},l),x),condensate:p("g",l,a.extend({fill:"black"},x),p("rect",{x:-.5*n,y:-o,width:n,height:2*o},{fill:"white",thickness:0})+p("circle",{cx:-.5*n,cy:0,r:o})+p("circle",{cx:.5*n,cy:0,r:o})),hadron:p("g",l,x,p("path",{d:q("M 0,0 L",n,",0","M 0,",o,"L",n,",",o,"M 0,",-o,"L",n,",",-o)})+p("polygon",{points:r?q(n,",",2*o,n+3.6*o,",0",n,",",-2*o):q(.5*n-1.6*o,",",2*o,.5*n+2*o,",0",.5*n-1.6*o,",",-2*o)},{fill:"white"})),zigzag:p("polyline",a.extend({points:y},l),x)}[m]}return h?p("g",w("symbol"),b,h):""},I=function(){var b=e.node.show===!0?"iova":e.node.show,c=e.node.type,d=a.extend({},g,{fill:e.node.fill,color:e.node.color,thickness:e.node.thickness}),f=e.node.radius+d.thickness,h=f/Math.SQRT2-("cross"==c?0:d.thickness),i="";for(var k in j)if(b.indexOf(k.charAt(0))>=0){var l=v(k+"_"+c),m=+j[k][0],n=+j[k][1],o={x:m-f,y:n-f,width:2*f,height:2*f},r={cx:m,cy:n,r:f},t={d:q("M",-h,",",-h,"L",h,",",h,"M",-h,",",h,"L",h,",",-h),transform:s(m,n,0)};i+={box:p("rect",o,l),boxtimes:p("g",{},l,p("rect",o)+p("path",t)),cross:p("path",t,l),dot:p("circle",r,l),otimes:p("g",{},l,p("circle",r)+p("path",t))}[c]}return i?p("g",w("node"),d,i):""},J=function(a){a=a.replace(/[\s\{\}]+/g,"").replace(/(_[^_]+)(\^[^\^]+)/g,"$2$1");var b=n.sty.size,c={size:Math.round(.8*b)},d=a.charAt(0),e=a.indexOf("^")+1,f=a.indexOf("_")+1,g=e?e:f,h=-.15*b,i=.4*b;return(d.match(/-|~/)?p("tspan",{dx:q("0",4*h),dy:q(-i,i)},{},("-"==d?"&#8211;":d)+(g?a.slice(1,g-1):a.slice(1))):p("tspan",{},{},g?a.slice(0,g-1):a.slice(0)))+(e?p("tspan",{dx:q(h),dy:q(-i)},c,f?a.slice(e,f-1):a.slice(e)):"")+(f?p("tspan",{dx:q((e?5:1)*h),dy:q((e?2:1)*i)},c,a.slice(f)):"")},K=function(){var b="",c=2*n.sty.size;for(var d in n.pos){var f=n.pos[d],g=u(f[0]),h={x:q(g[0]),y:q(g[1])},i=v(d);b+=e.mathjax?p("foreignObject",a.extend({},h,{width:f[2]||.6*c,height:f[3]||c}),i,p("body",{xmlns:"http://www.w3.org/1999/xhtml"},{},f[1])):p("text",h,i,J(f[1]))}return b?p("g",w("label"),n.sty,b):""},L=function(){var b="";for(var c in e.image){var d=e.image[c],f=u(d[0]),g=q(f[0]),h=q(f[1]),i=v(c);e.ajax?(i=e.selector?i.id+"_":"",a.ajax({url:d[1],dataType:"text",async:!1,success:function(a){a=a.replace(/<\?.*\?>\n*/,""),a=a.slice(0,a.search(">")).replace(/ x=.\d+./,"").replace(/ y=.\d+./,"")+a.slice(a.search(">")),b+=a.replace(/>/,' x="'+g+'" y="'+h+'">').replace(/(id=.)/g,"$1"+i).replace(/(href=.#)/g,"$1"+i)},error:function(){throw new Error("fail to load "+d[1])}})):b+=p("image",{href:d[1],x:g,y:h},a.extend({width:d[2]||32,height:d[3]||32},d[3]?{}:{preserveAspectRatio:"xMinYMin meet"},i))}return b?p("g",w("image"),{},b):""};this.output=function(){if(!document.createElementNS||!document.createElementNS(e.xmlns,"svg").createSVGRect)return"Your browser does not support SVG.";if(e.grid.show){var d=q(e.grid.unit);o.defs.push(p("pattern",{x:0,y:0,width:d,height:d,viewBox:q(0,0,d,d)},{patternUnits:"userSpaceOnUse",id:b.prefix+"_grid"},p("polyline",{points:d+",0 0,0 0,"+d},{fill:"none",color:"silver"}))),o.body.push(p("rect",{x:0,y:0,width:"100%",height:"100%"},{fill:"url(#"+b.prefix+"_grid)",color:"silver"}))}o.body.push(G()+H()),e.node.show&&o.body.push(I()),o.body.push(K()+L());var f=p("svg",{xmlns:e.xmlns,xlink:e.xlink,version:e.version,x:e.x,y:e.y,width:e.width,height:e.height,viewBox:q(e.x,e.y,e.width,e.height)},e.selector?{id:b.prefix}:{},(e.title?p("title",{},{},e.title):"")+(e.description?p("desc",{},{},e.description):"")+(o.defs.length?p("defs",{},{},o.defs.join("")):"")+(o.body.length?o.body.join(""):""));if(e.standalone){var g='<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n'+f;f='<div class="feyn" style="display:inline-block;">'+f+'</div><textarea cols="80" style="margin-left:5px;padding:3px;'+"height:"+(e.height-8)+'px;" spellcheck="false">'+g.replace(/&/g,"&#38;").replace(/"(.+?)"/g,"&#34;$1&#34;").replace(/</g,"&#60;").replace(/>/g,"&#62;")+"</textarea>",a(c).change(function(){f=a(this).children("textarea").val(),a(this).children(".feyn").html(f.slice(f.search("<svg")))})}return f}}}(jQuery);
