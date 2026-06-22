# -*- coding: utf-8 -*-
"""Single source of truth for the CIVIS BIP 2026 Naxos field guide.
Generates assets/js/data.js plus offline downloads/*.gpx and *.kml.
Re-run after editing FG to regenerate everything for a new cohort."""
import json, io, html

BASE = {"name": "KTEL Central Bus Station", "el": "ΚΤΕΛ Χώρας", "lat": 37.10799, "lng": 25.37442}

FG = {
 "meta": {
   "title": "Naxos & Koufonísi",
   "subtitle": "Climate change & coastal landscape evolution",
   "course": "CIVIS BIP 2026 — Physical part",
   "dates": "29 June – 3 July 2026",
   "alliance": "CIVIS — A European Civic University",
   "host": "National and Kapodistrian University of Athens",
   "hostShort": "NKUA · Faculty of Geology & Geoenvironment",
   "author": "Prof. Niki Evelpidou",
   "base": BASE,
 },
 "days": [
  {"n": 1, "weekday": "Monday", "date": "29 June 2026", "departure": "09:00",
   "theme": "Landscape, geology & people — culture and history",
   "stops": [
     {"time": "09:00", "mode": "meet", "title": "Central Bus Station (KTEL)", "el": "ΚΤΕΛ Χώρας", "lat": 37.10799, "lng": 25.37442,
      "desc": "Meeting point for the day. The bus departs at 09:00 — please arrive 10 minutes early."},
     {"time": "09:15", "mode": "foot", "title": "Portara — Temple of Apollo", "el": "Πορτάρα — Ναός Απόλλωνα", "lat": 37.11013, "lng": 25.37247,
      "desc": "A short walk to the marble gateway of the unfinished Temple of Apollo on the Palatía islet. A vantage point to introduce the island's landscape and recall the earlier, more humid palaeoclimate."},
     {"time": "10:45", "mode": "bus", "title": "Kouros of Melanes", "el": "Κούρος Μελάνων", "lat": 37.08350, "lng": 25.45208, "photo": "melanes.jpg",
      "desc": "An unfinished colossal marble statue lying in its ancient quarry near Melanes, abandoned in the Archaic period — a vivid example of how the island's geology shaped ancient quarrying and art."},
     {"time": "12:45", "mode": "bus", "title": "Ancient Aqueduct of Flerio", "el": "Αρχαίο Υδραγωγείο Φλεριού", "lat": 37.08762, "lng": 25.44589,
      "desc": "Remains of the ancient aqueduct in the fertile Flerio plain between Melanes and Chora. We discuss the relationship between geology, relief and ancient water infrastructure."},
     {"time": "18:45", "mode": "bus", "title": "Agia Anna – Paradeisos", "el": "Αγία Άννα – Παράδεισος", "lat": 37.06487, "lng": 25.35371,
      "desc": "On the coast we read sea-level indicators and fluctuations — how coastal features record past tectonic and eustatic sea-level change."},
     {"time": "21:00", "mode": "foot", "title": "Ursulines Cultural Center", "el": "Πνευματικό Κέντρο Ουρσουλινών", "lat": 37.10560, "lng": 25.37680, "photo": "ursulines.jpg",
      "desc": "An evening class of traditional Greek dances in the historic former Ursuline school in Chora — a space that keeps local heritage and community life alive."}
   ]},
  {"n": 2, "weekday": "Tuesday", "date": "30 June 2026", "departure": "09:00",
   "theme": "Landscape, environment, geology, tectonics",
   "stops": [
     {"time": "09:00", "mode": "meet", "title": "Central Bus Station (KTEL)", "el": "ΚΤΕΛ Χώρας", "lat": 37.10799, "lng": 25.37442,
      "desc": "Meeting point. Departure at 09:00."},
     {"time": "09:30", "mode": "bus", "title": "Apeiranthos", "el": "Απείρανθος", "lat": 37.07133, "lng": 25.52024, "photo": "apeiranthos.jpg",
      "desc": "A mountain village in the heart of Naxos. At its Geological Museum we get an introduction to the island's geological, geomorphological and palaeogeographical history (and a virtual visit to an emery mine), then a guided walk through the village with a local."},
     {"time": "17:30", "mode": "foot", "title": "Lagouna — Agios Georgios", "el": "Λαγκούνα — Άγιος Γεώργιος", "lat": 37.08687, "lng": 25.36395, "photo": "lagoon.jpg",
      "desc": "A 1.4 km coastal traverse from Chora covering a remarkable range of features.",
      "topics": ["Granodiorite outcrops", "Agios Georgios coastal processes", "Sand-dune experiment", "Lagouna palaeogeography", "Aeolianites", "Ancient quarries", "Beachrocks", "Tafoni weathering", "Nature-based solutions"]},
     {"time": "21:30", "mode": "foot", "title": "Ursulines Cultural Center", "el": "Πνευματικό Κέντρο Ουρσουλινών", "lat": 37.10560, "lng": 25.37680, "photo": "ursulines.jpg",
      "desc": "A second evening of traditional Greek dance at the Ursulines Cultural Center in Chora."}
   ]},
  {"n": 3, "weekday": "Wednesday", "date": "1 July 2026", "departure": "09:00",
   "theme": "Coastal processes",
   "stops": [
     {"time": "09:00", "mode": "meet", "title": "Central Bus Station (KTEL)", "el": "ΚΤΕΛ Χώρας", "lat": 37.10799, "lng": 25.37442,
      "desc": "Meeting point. Departure at 09:00."},
     {"time": "09:15", "mode": "foot", "title": "Aplomata — Grotta", "el": "Απλώματα — Γρόττα", "lat": 37.10999, "lng": 25.38189, "photo": "grotta.jpg",
      "desc": "A coastal walk from the port toward Grotta, with excellent exposures of coastal geomorphology within an urban setting — our introduction to the interplay of geology, sea-level change, coastal processes and human occupation."},
     {"time": "11:30", "mode": "bus", "title": "Agia Anna", "el": "Αγία Άννα", "lat": 37.06691, "lng": 25.35504,
      "desc": "Coastal transfer point before the sea crossing."},
     {"time": "11:45", "mode": "boat", "title": "Paros (by boat)", "el": "Πάρος (με πλοίο)", "lat": 37.08560, "lng": 25.15170,
      "desc": "Boat crossing to neighbouring Paros for coastal observations, returning to Chora in the afternoon."}
   ]},
  {"n": 4, "weekday": "Thursday", "date": "2 July 2026", "departure": "08:30",
   "theme": "Coastal processes",
   "stops": [
     {"time": "08:30", "mode": "meet", "title": "Central Bus Station (KTEL)", "el": "ΚΤΕΛ Χώρας", "lat": 37.10799, "lng": 25.37442,
      "desc": "Meeting point. Departure at 08:30."},
     {"time": "08:45", "mode": "bus", "title": "Temple of Dionysus, Yria", "el": "Ναός Διονύσου, Ύρια", "lat": 37.07748, "lng": 25.38165,
      "desc": "By the Peritsís river, the island's most important watercourse. Rebuilt repeatedly after floods since antiquity, the sanctuary was once reached through the bay — now the lagoon — in front of today's airport.",
      "link": {"label": "About Yria (naxos.net)", "url": "https://www.naxos.net/monuments/yria/"}},
     {"time": "10:15", "mode": "bus", "title": "Plaka beach", "el": "Παραλία Πλάκα", "lat": 37.03586, "lng": 25.37947, "photo": "beachrock.jpg",
      "desc": "A textbook coast: three parallel rows of beachrock at different distances from the shoreline. We discuss the February storm events that damaged the coastal road, then snorkel to observe the beachrocks from within the sea.",
      "bring": ["Swimsuit", "Mask or goggles for underwater observation"]},
     {"time": "12:00", "mode": "bus", "title": "Pyrgaki", "el": "Πυργάκι", "lat": 36.97500, "lng": 25.40631, "photo": "dunes.jpg",
      "desc": "Coastal dune system in the south of the island.",
      "topics": ["Sand dunes", "Fluvial–coastal processes", "Anthropogenic interference", "OSL sampling"]},
     {"time": "14:10", "mode": "bus", "title": "Kagkanis Farm", "el": "Αγρόκτημα Καγκάνη", "lat": 37.01230, "lng": 25.43805, "photo": "kagkanis.jpg",
      "desc": "A shared traditional meal in a rural setting — a welcome pause in the field-intensive schedule."}
   ]},
  {"n": 5, "weekday": "Friday", "date": "3 July 2026", "departure": "08:00",
   "theme": "Coastal processes — Koufonísi",
   "stops": [
     {"time": "08:00", "mode": "meet", "title": "Central Bus Station (KTEL)", "el": "ΚΤΕΛ Χώρας", "lat": 37.10799, "lng": 25.37442,
      "desc": "Meeting point. Departure at 08:00."},
     {"time": "08:15", "mode": "bus", "title": "Volakas", "el": "Βόλακας", "lat": 36.96916, "lng": 25.55559,
      "desc": "Transfer through the south of the island toward the embarkation point."},
     {"time": "09:30", "mode": "boat", "title": "Pano Koufonísi", "el": "Πάνω Κουφονήσι", "lat": 36.93760, "lng": 25.60530, "photo": "koufonisi.jpg",
      "desc": "We walk the magnificent coastline of Pano Koufonísi — sedimentary rocks sculpted by marine processes, with cliffs, pocket beaches and evaporite structures."}
   ]}
 ]
}


def esc(s):
    return html.escape(s, quote=True)


def main():
    io.open("assets/js/data.js", "w", encoding="utf-8").write(
        "window.FIELD_GUIDE = " + json.dumps(FG, ensure_ascii=False, indent=2) + ";\n")

    g = ['<?xml version="1.0" encoding="UTF-8"?>',
         '<gpx version="1.1" creator="CIVIS BIP 2026 Naxos field guide" xmlns="http://www.topografix.com/GPX/1/1">',
         '<metadata><name>CIVIS BIP 2026 — Naxos &amp; Koufonisi field guide</name></metadata>']
    seen = set()
    for d in FG["days"]:
        for s in d["stops"]:
            key = (round(s["lat"], 5), round(s["lng"], 5), s["title"])
            if key in seen:
                continue
            seen.add(key)
            nm = "D%d %s · %s" % (d["n"], s["time"], s["title"])
            g.append('  <wpt lat="%s" lon="%s"><name>%s</name><desc>%s</desc></wpt>'
                     % (s["lat"], s["lng"], esc(nm), esc(s["desc"])))
    g.append('</gpx>')
    io.open("downloads/naxos-fieldguide.gpx", "w", encoding="utf-8").write("\n".join(g))

    k = ['<?xml version="1.0" encoding="UTF-8"?>',
         '<kml xmlns="http://www.opengis.net/kml/2.2"><Document>',
         '<name>CIVIS BIP 2026 — Naxos &amp; Koufonisi</name>']
    for d in FG["days"]:
        k.append('<Folder><name>Day %d — %s</name>' % (d["n"], esc(d["date"])))
        for s in d["stops"]:
            nm = "%s · %s" % (s["time"], s["title"])
            k.append('<Placemark><name>%s</name><description>%s</description>'
                     '<Point><coordinates>%s,%s,0</coordinates></Point></Placemark>'
                     % (esc(nm), esc(s["desc"]), s["lng"], s["lat"]))
        k.append('</Folder>')
    k.append('</Document></kml>')
    io.open("downloads/naxos-fieldguide.kml", "w", encoding="utf-8").write("\n".join(k))

    nstops = sum(len(d["stops"]) for d in FG["days"])
    print("OK days=%d stops=%d unique_wpts=%d" % (len(FG["days"]), nstops, len(seen)))


if __name__ == "__main__":
    main()
