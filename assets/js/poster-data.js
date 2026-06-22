(function () {
  "use strict";
  var FG = window.FIELD_GUIDE;
  var keyOf = function (s) { return s.lat.toFixed(4) + "," + s.lng.toFixed(4); };
  var numByKey = {};
  var next = 1;
  var base = null;

  FG.days.forEach(function (d) {
    d.stops.forEach(function (s) {
      if (s.mode === "meet" && !base) base = { lat: s.lat, lng: s.lng, title: s.title };
    });
  });

  var days = FG.days.map(function (d) {
    var stops = d.stops.filter(function (s) { return s.mode !== "meet"; }).map(function (s) {
      var k = keyOf(s);
      var no = numByKey[k];
      if (no === undefined) { no = next++; numByKey[k] = no; }
      var onMap = s.title.indexOf("Paros") === -1;
      return { no: no, time: s.time, title: s.title, mode: s.mode, onMap: onMap, lat: s.lat, lng: s.lng };
    });
    return { n: d.n, weekday: d.weekday, date: d.date, theme: d.theme, departure: d.departure, stops: stops };
  });

  var seen = {};
  var mapStops = [];
  days.forEach(function (d) {
    d.stops.forEach(function (s) {
      if (s.onMap && !seen[s.no]) { seen[s.no] = 1; mapStops.push({ no: s.no, lat: s.lat, lng: s.lng, title: s.title }); }
    });
  });

  window.POSTER = { base: base, mapStops: mapStops, days: days, meta: FG.meta };
})();
