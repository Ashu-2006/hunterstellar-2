# Generates the Hunterstellar 2.0 wireframe artboards.
# One shared style base so 22 screens stay visually consistent; each .dc.html
# is standalone because artboards share nothing at runtime.
import io, os

HEAD = """<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap">
  <style>
    :root{
      --v0:#0B0A09;--v1:#131110;--h2:#1C1917;--h3:#262220;--h4:#383230;--h5:#4A423E;
      --r4:#EA6A22;--r5:#C2410C;--em:#FDBA74;
      --vg:#7C5CFF;--vd:#2A1B4D;
      --g3:#FFD6A0;--g5:#B8860B;
      --sg:#4EA8DE;--wa:#FBBF24;--fa:#F0503C;
      --i0:#FAF7F2;--i1:#DCD5CC;--i3:#9A928A;--i5:#6B635D;
    }
    *{box-sizing:border-box}
    body{margin:0;width:360px;height:640px;background:var(--v0);color:var(--i1);
      font-family:'Space Grotesk',system-ui,sans-serif;font-size:14px;
      overflow:hidden;position:relative}
    .grain{position:absolute;inset:0;pointer-events:none;z-index:9;opacity:.20;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3CfeColorMatrix type='luminanceToAlpha'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size:180px 180px}
    .scan{position:absolute;inset:0;pointer-events:none;z-index:8;opacity:.42;
      background:repeating-linear-gradient(180deg,transparent 0 2px,rgba(0,0,0,.18) 2px 3px)}
    .vig{position:absolute;inset:0;pointer-events:none;z-index:7;
      background:radial-gradient(ellipse at 50% 35%,transparent 42%,#0B0A09 100%);opacity:.85}
    .wrap{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;padding:20px 24px 0}
    .d{font-family:'Bebas Neue',Impact,sans-serif;letter-spacing:.02em;line-height:.92;color:var(--i0)}
    .m{font-family:'JetBrains Mono',ui-monospace,monospace}
    .lbl{font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:var(--i3);font-weight:700}
    .plate{background:var(--h2);border:1px solid var(--h4);border-radius:8px;padding:16px}
    .btn{height:48px;display:flex;align-items:center;justify-content:center;border-radius:8px;
      background:var(--r4);color:#0B0A09;font-weight:700;letter-spacing:.08em;
      text-transform:uppercase;font-size:13px}
    .btn.ghost{background:transparent;border:1px solid var(--h5);color:var(--i1)}
    .btn.void{background:var(--vg);color:#0B0A09}
    .btn.off{background:var(--h4);color:var(--i5)}
    .inp{height:48px;border-radius:8px;background:var(--v1);border:1px solid var(--h5);
      display:flex;align-items:center;padding:0 14px;color:var(--i3);font-size:16px}
    .inp.dim{opacity:.45}
    .hint{font-size:12px;color:var(--i3);line-height:1.45}
    .nav{position:absolute;left:0;right:0;bottom:0;height:64px;background:var(--h3);
      border-top:1px solid var(--h4);display:grid;grid-template-columns:repeat(4,1fr);z-index:6}
    .navi{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;
      font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--i3)}
    .navi.on{color:var(--r4)}
    .rail{position:absolute;top:0;height:2px;background:var(--r4)}
    .bar{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:6px;font-size:11px}
    a{color:var(--sg);text-decoration:none}
    a:hover{color:var(--em)}
  </style>
</helmet>
<div class="grain"></div>
<div class="scan"></div>
<div class="vig"></div>
"""

TAIL = """
</x-dc>
</body>
</html>
"""


def nav(active, frag_dot=False, journey_dot=False):
    items = [("Crew", "crew"), ("Journey", "journey"), ("Fragments", "frag"), ("Ranks", "ranks")]
    icons = {
        "crew": "<circle cx='7' cy='9' r='2.4'/><circle cx='13' cy='9' r='2.4'/><path d='M3 17c0-2.6 2-4 5-4M17 17c0-2.6-2-4-5-4'/>",
        "journey": "<circle cx='10' cy='10' r='7.5'/><path d='M7.5 10.5l2.5 2.5 4-5'/>",
        "frag": "<path d='M10 2.5l5 4-1.8 6.5H6.8L5 6.5z'/><path d='M6.8 13L10 17.5 13.2 13'/>",
        "ranks": "<path d='M4 16v-5M10 16V4M16 16v-8'/>",
    }
    out = ['<div class="nav">']
    slot = ["Crew", "Journey", "Fragments", "Ranks"].index(active)
    out.append('<div class="rail" style="left:' + str(slot * 25) + '%;width:25%"></div>')
    for label, key in items:
        on = " on" if label == active else ""
        col = "#EA6A22" if label == active else "#9A928A"
        dot = ""
        if key == "frag" and frag_dot:
            dot = "<span style='position:absolute;margin:-14px 0 0 16px;width:6px;height:6px;border-radius:50%;background:#FFD6A0'></span>"
        if key == "journey" and journey_dot:
            dot = "<span style='position:absolute;margin:-14px 0 0 18px;width:6px;height:6px;border-radius:50%;background:#FBBF24'></span>"
        out.append(
            '<div class="navi' + on + '">' + dot +
            "<svg width='20' height='20' viewBox='0 0 20 20' fill='none' stroke='" + col +
            "' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'>" + icons[key] +
            "</svg><span>" + label + "</span></div>")
    out.append("</div>")
    return "".join(out)


def rail(done, current, total=5, void_lit=False):
    """Progress rail. Locked nodes show no name — the reveal mechanic."""
    out = ['<div style="display:flex;align-items:center;gap:0;width:100%">']
    for i in range(total):
        if i < done:
            fill, stroke, inner = "#EA6A22", "#EA6A22", ""
        elif i == current:
            fill, stroke, inner = "none", "#EA6A22", ""
        elif i == total - 1 and void_lit:
            fill, stroke, inner = "none", "#7C5CFF", ""
        elif i == total - 1:
            fill, stroke, inner = "none", "#383230", ""
        else:
            fill, stroke, inner = "none", "#383230", ""
        ring = ""
        if i == current:
            ring = "<circle cx='9' cy='9' r='8' fill='none' stroke='#EA6A22' stroke-opacity='.3' stroke-width='1'/>"
        out.append(
            "<svg width='18' height='18' viewBox='0 0 18 18' style='flex:0 0 auto'>" + ring +
            "<path d='M9 2.5L15.5 9 9 15.5 2.5 9z' fill='" + fill + "' stroke='" + stroke +
            "' stroke-width='1.4'/>" + inner + "</svg>")
        if i < total - 1:
            c = "#EA6A22" if i < done else "#383230"
            out.append("<div style='flex:1;height:1.5px;background:" + c + "'></div>")
    out.append("</div>")
    return "".join(out)


def rail_labels(done, current, names, total=5):
    out = ['<div style="display:flex;justify-content:space-between;margin-top:7px">']
    for i in range(total):
        if i < done or i == current:
            t, c = names[i], ("#DCD5CC" if i == current else "#9A928A")
        else:
            t, c = "···", "#4A423E"
        out.append("<span style='font-size:9px;letter-spacing:.1em;color:" + c +
                   ";width:52px;text-align:center'>" + t + "</span>")
    out.append("</div>")
    return "".join(out)


def shard(size=64, color="#FFD6A0", op="1"):
    return ("<svg width='" + str(size) + "' height='" + str(size) + "' viewBox='0 0 40 40' fill='none' "
            "opacity='" + op + "'><path d='M20 3l13 9-4.5 18h-17L7 12z' stroke='" + color +
            "' stroke-width='1.5' stroke-linejoin='round'/>"
            "<path d='M20 3v27M7 12l26 0' stroke='" + color + "' stroke-width='.7' stroke-opacity='.45'/></svg>")


def head_bar(eyebrow, title, right=""):
    return ('<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">'
            '<div><div class="lbl">' + eyebrow + '</div>'
            '<div class="d" style="font-size:28px;margin-top:3px">' + title + '</div></div>'
            + right + '</div>')


S = {}

# ---------------------------------------------------------------- 1 SPLASH
S["Main"] = """
<div class="wrap" style="justify-content:center;align-items:center;padding-bottom:60px">
  <div class="d" style="font-size:46px;color:var(--r4)">Hunterstellar</div>
  <div class="m" style="font-size:15px;color:var(--em);letter-spacing:.34em;margin-top:8px">2.0</div>
  <div style="width:64px;height:1px;background:var(--r5);margin:22px 0"></div>
  <div class="lbl" style="font-size:10px">Rust Bucket &middot; Shuttle Ops</div>
</div>
<div style="position:absolute;left:24px;right:24px;bottom:46px;z-index:3">
  <div style="height:2px;background:var(--h4);border-radius:2px;overflow:hidden">
    <div style="width:38%;height:100%;background:var(--r4)"></div>
  </div>
  <div class="hint" style="text-align:center;margin-top:10px;font-size:10px;letter-spacing:.2em;text-transform:uppercase">Establishing link</div>
</div>
"""

# ---------------------------------------------------------------- 2-4 LOGIN
def login(state):
    if state == "submitting":
        btn = '<div class="btn off">Establishing link&hellip;</div>'
        bar = ('<div style="height:2px;background:var(--h4);margin-top:10px;border-radius:2px;overflow:hidden">'
               '<div style="width:55%;height:100%;background:var(--r4)"></div></div>')
        err = ""
        dim = " dim"
    elif state == "error":
        btn = '<div class="btn">Engage</div>'
        bar = ""
        err = ('<div class="bar" style="border:1px solid rgba(240,80,60,.4);background:rgba(240,80,60,.1);'
               'color:var(--fa);margin-top:12px;align-items:flex-start">'
               '<span style="line-height:1.4"><b>That callsign and code don\'t match.</b><br>'
               '<span style="color:var(--i3)">Check your registration email.</span></span></div>')
        dim = ""
    else:
        btn = '<div class="btn">Engage</div>'
        bar = ""
        err = ""
        dim = ""
    return """
<div class="wrap">
  <div style="margin-top:26px">
    <div class="d" style="font-size:30px;color:var(--r4)">Hunterstellar <span class="m" style="font-size:12px;color:var(--em);letter-spacing:.2em">2.0</span></div>
    <div class="hint" style="margin-top:6px">Identify your shuttlecraft.</div>
  </div>
  <div style="margin-top:30px;display:flex;flex-direction:column;gap:16px">
    <div>
      <div class="lbl" style="margin-bottom:7px">Shuttlecraft Callsign</div>
      <div class="inp""" + dim + """"><span class="m">NIGHTJAR</span></div>
    </div>
    <div>
      <div class="lbl" style="margin-bottom:7px">Rust Bucket Access Code</div>
      <div class="inp""" + dim + """" style="justify-content:space-between">
        <span class="m">&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</span>
        <span style="font-size:11px;color:var(--i5)">SHOW</span>
      </div>
    </div>
  </div>
  """ + err + """
  <div style="margin-top:20px">""" + btn + bar + """</div>
  <div class="hint" style="margin-top:26px">
    Registered by form &mdash; there are no accounts here.
    Ask a marshal if your callsign fails.
  </div>
  <div style="margin-top:auto;margin-bottom:26px">
    <span style="font-size:12px;color:var(--sg);letter-spacing:.1em">LEADERBOARD &rarr;</span>
  </div>
</div>
"""

S["LoginIdle"] = login("idle")
S["LoginSubmitting"] = login("submitting")
S["LoginError"] = login("error")

# ---------------------------------------------------------------- 5 CREW
S["Crew"] = """
<div class="wrap" style="padding-bottom:74px;overflow:hidden">
  """ + head_bar("Crew Manifest", "The Nightjar") + """
  <div class="plate" style="padding:14px 16px">
    <div style="display:flex;align-items:center;gap:9px">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="#EA6A22"><path d="M10 2l2.4 5.2 5.6.7-4.1 3.9 1.1 5.6L10 14.7 4.9 17.4 6 11.8 1.9 7.9l5.6-.7z"/></svg>
      <span style="color:var(--i0);font-weight:700">Aarav Menon</span>
      <span class="lbl" style="font-size:9px;color:var(--r4)">Captain</span>
    </div>
    <div style="height:1px;background:var(--h4);margin:11px 0"></div>
    <div class="hint" style="line-height:1.7">Ishita Rao &middot; Dev Sharma &middot; Nikhil Bose</div>
  </div>

  <div style="margin-top:18px;border:1px dashed rgba(251,191,36,.5);border-left:3px solid var(--wa);
       border-radius:8px;padding:14px 16px;background:rgba(251,191,36,.05)">
    <div class="lbl" style="color:var(--wa);font-size:10px">Transmission &middot; Rust Bucket</div>
    <div class="m" style="margin-top:9px;font-size:11px;color:var(--wa)">PROLOGUE_TEXT_PENDING</div>
    <div class="hint" style="margin-top:9px;font-size:11px">
      Five paragraphs: where you are &middot; what&rsquo;s wrong &middot; the plan
      &middot; why bearings differ per crew &middot; the send-off.
    </div>
  </div>

  <div style="margin-top:auto;display:flex;flex-direction:column;gap:10px">
    <div class="plate" style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px">
      <span style="font-size:13px">Reduce texture</span>
      <div style="width:38px;height:22px;border-radius:99px;background:var(--h4);position:relative">
        <div style="position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:var(--i3)"></div>
      </div>
    </div>
    <div style="text-align:center;font-size:12px;color:var(--fa);letter-spacing:.1em">SIGN OUT</div>
  </div>
</div>
""" + nav("Crew")

# ---------------------------------------------------------------- 6 CLUE
NAMES = ["Carina", "Verra", "Nyx", "Solune", "Void"]
S["JourneyClue"] = """
<div class="wrap" style="padding-bottom:74px">
  <div class="lbl">Stop 2 of 5</div>
  <div style="margin-top:11px">""" + rail(1, 1) + rail_labels(1, 1, NAMES) + """</div>

  <div class="plate" style="margin-top:16px">
    <div class="lbl" style="color:var(--r4);font-size:10px">Inbound Signal</div>
    <div style="margin-top:9px;color:var(--i0);font-size:16px;line-height:1.5">
      Where the long benches face the water and the third pillar
      carries a scar, the relay still listens.
    </div>
    <div style="margin-top:12px;height:96px;border-radius:6px;border:1px solid var(--h4);
         background:var(--v1);display:flex;align-items:center;justify-content:center">
      <span class="hint" style="font-size:11px">clue image</span>
    </div>
  </div>

  <div class="hint" style="margin-top:10px;font-size:11px;color:var(--i5)">
    Bearings are scrambled. Trust the clue, not the name.
  </div>

  <div style="margin-top:auto">
    <div class="lbl" style="margin-bottom:7px">Station Code</div>
    <div class="inp"><span class="m" style="letter-spacing:.22em">&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;</span></div>
    <div class="hint" style="margin:9px 0 12px;color:var(--wa);font-size:11px">
      A wrong code locks your team out for 15 minutes.
    </div>
    <div class="btn" style="margin-bottom:18px">Decrypt Signal</div>
  </div>
</div>
""" + nav("Journey")

# ---------------------------------------------------------------- 7 QUESTION
S["JourneyQuestion"] = """
<div class="wrap" style="padding-bottom:74px">
  <div class="lbl">Stop 2 of 5</div>
  <div style="margin-top:11px">""" + rail(1, 1) + rail_labels(1, 1, NAMES) + """</div>

  <div class="plate" style="margin-top:16px;border-left:3px solid var(--g5)">
    <div class="lbl" style="color:var(--g3);font-size:10px">Archive Lock</div>
    <div style="margin-top:9px;color:var(--i0);font-size:16px;line-height:1.5">
      The relay logged one burst it could not name. It arrived
      before the event it recorded. What does the archive call that?
    </div>
  </div>

  <div style="margin-top:auto">
    <div class="lbl" style="margin-bottom:7px">Answer</div>
    <div class="inp"><span style="color:var(--i5);font-size:15px">Type your answer</span></div>
    <div class="hint" style="margin:9px 0 12px;font-size:11px">
      Wrong answers cost nothing. Take your time.
    </div>
    <div class="btn" style="margin-bottom:18px">Submit Answer</div>
  </div>
</div>
""" + nav("Journey")

# ---------------------------------------------------------------- 8 FRAGMENT
S["FragmentReveal"] = """
<div class="wrap" style="padding-bottom:74px;align-items:center;justify-content:center;text-align:center">
  """ + shard(72) + """
  <div class="lbl" style="color:var(--g3);margin-top:20px">Fragment Recovered</div>
  <div class="d" style="font-size:34px;color:var(--g3);margin-top:8px">Fragment II</div>
  <div style="width:100%;margin-top:20px;border:1px solid rgba(255,214,160,.32);
       background:rgba(255,214,160,.06);border-radius:8px;padding:16px">
    <div class="m" style="font-size:12.5px;color:var(--g3);line-height:1.75;text-align:left">
      burst signature matches the pulse profile &mdash; flagged, unexplained_
    </div>
  </div>
  <div class="hint" style="margin-top:14px;font-size:11px">
    Saved to Fragments. You can re-read it any time.
  </div>
  <div class="btn" style="width:100%;margin-top:auto;margin-bottom:18px">Plot Next Course</div>
</div>
""" + nav("Journey", frag_dot=True)

# ---------------------------------------------------------------- 9 LOCKED
S["JourneyLocked"] = """
<div class="wrap" style="padding-bottom:74px">
  <div class="lbl">Stop 2 of 5</div>
  <div style="margin-top:11px">""" + rail(1, 1) + rail_labels(1, 1, NAMES) + """</div>

  <div class="bar" style="margin-top:14px;border:1px solid rgba(240,80,60,.4);
       background:rgba(240,80,60,.1);color:var(--fa)">
    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="#F0503C" stroke-width="1.7">
      <rect x="4" y="9" width="12" height="8" rx="1.5"/><path d="M7 9V6.5a3 3 0 016 0V9"/></svg>
    <span>Locked out &mdash; wrong code</span>
  </div>

  <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
    <svg width="58" height="58" viewBox="0 0 40 40" fill="none" stroke="#FBBF24" stroke-width="1.4">
      <path d="M20 3l14.7 8.5v17L20 37 5.3 28.5v-17z"/><path d="M12 20h16"/></svg>
    <div class="d" style="font-size:30px;color:var(--wa);margin-top:16px">Signal Jammed</div>
    <div class="hint" style="margin-top:8px;max-width:250px">
      The station sealed you out. Entry reopens when the timer runs down.
    </div>
    <div class="m" style="font-size:32px;color:var(--wa);margin-top:18px;letter-spacing:.06em">12:43</div>
  </div>

  <div class="plate" style="margin-bottom:18px;display:flex;align-items:center;justify-content:space-between">
    <span class="hint">Your fragments are still readable</span>
    <span style="color:var(--sg);font-size:12px">&rarr;</span>
  </div>
</div>
""" + nav("Journey", journey_dot=True)

# ------------------------------------------------- 10-13 COMPLICATION
SKIP = ('<div style="position:absolute;top:20px;right:22px;z-index:5;font-size:11px;'
        'letter-spacing:.2em;color:var(--i5)">SKIP</div>')

S["Complication1"] = SKIP + """
<div class="wrap" style="align-items:center;justify-content:center">
  <div class="lbl" style="margin-bottom:26px">Assembling</div>
  <div style="position:relative;width:200px;height:200px">
    <div style="position:absolute;top:0;left:14px">""" + shard(46, op=".85") + """</div>
    <div style="position:absolute;top:8px;right:12px">""" + shard(46, op=".85") + """</div>
    <div style="position:absolute;bottom:6px;left:26px">""" + shard(46, op=".85") + """</div>
    <div style="position:absolute;bottom:0;right:24px">""" + shard(46, op=".85") + """</div>
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)">
      <svg width="70" height="70" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="15" stroke="#B8860B" stroke-width=".8" stroke-dasharray="3 4"/>
      </svg>
    </div>
  </div>
  <div class="hint" style="margin-top:26px;font-size:11px">Four fragments converging</div>
</div>
"""

S["Complication2"] = SKIP + """
<div class="wrap" style="justify-content:center">
  <div class="lbl" style="margin-bottom:20px;text-align:center">Assembled Transmission</div>
  <div style="display:flex;flex-direction:column;gap:12px">
    <div class="m" style="font-size:12px;color:var(--g3);opacity:.85;line-height:1.6">
      <span style="color:var(--g5)">I&nbsp;&nbsp;</span>firing window logged &mdash; tachyon pulse, scheduled_
    </div>
    <div class="m" style="font-size:12px;color:var(--g3);opacity:.85;line-height:1.6">
      <span style="color:var(--g5)">II&nbsp;</span>burst signature matches the pulse profile &mdash; unexplained_
    </div>
    <div class="m" style="font-size:12px;color:var(--g3);opacity:.85;line-height:1.6">
      <span style="color:var(--g5)">III</span> origin bearing resolves inward, along this hull&rsquo;s vector_
    </div>
    <div class="m" style="font-size:12px;color:var(--g3);opacity:.85;line-height:1.6">
      <span style="color:var(--g5)">IV&nbsp;</span>authorisation carries this shuttle&rsquo;s callsign_
    </div>
  </div>
  <div class="hint" style="margin-top:26px;text-align:center;font-size:11px;color:var(--i5)">
    [ owner supplies final lines &mdash; shape shown ]
  </div>
</div>
"""

S["Complication3"] = SKIP + """
<div class="wrap" style="align-items:center;justify-content:center;text-align:center">
  <div class="lbl" style="color:var(--fa);margin-bottom:22px">Reading</div>
  <div style="position:relative">
    <div class="d" style="font-size:38px;color:var(--vg);position:absolute;top:-2px;left:-3px;opacity:.55">
      The pulse was<br>already fired.<br>You fired it.
    </div>
    <div class="d" style="font-size:38px;color:var(--fa);position:absolute;top:2px;left:3px;opacity:.5">
      The pulse was<br>already fired.<br>You fired it.
    </div>
    <div class="d" style="font-size:38px;color:var(--i0);position:relative">
      The pulse was<br>already fired.<br>You fired it.
    </div>
  </div>
</div>
"""

S["Complication4"] = """
<div class="wrap" style="justify-content:center">
  <div class="lbl" style="color:var(--vg)">Course Correction</div>
  <div style="margin-top:14px;color:var(--i0);font-size:17px;line-height:1.55">
    [ Beat 3 &mdash; owner copy. Two sentences: the wound was made
    by the cure; the Null Void is where it started and the only
    place it can end. ]
  </div>
  <div style="margin-top:26px">""" + rail(4, 4, void_lit=True) + rail_labels(4, 4, NAMES) + """</div>
  <div class="btn void" style="margin-top:28px">Set Course for the Null Void</div>
</div>
"""

# ---------------------------------------------------------------- 14 NULL VOID
S["NullVoid"] = """
<div class="wrap" style="padding-bottom:74px">
  <div class="lbl" style="color:var(--vg)">Final Destination</div>
  <div class="d" style="font-size:36px;color:var(--vg);margin-top:5px">The Null Void</div>
  <div style="margin-top:13px">""" + rail(4, 4, void_lit=True) + """</div>

  <div style="margin-top:16px;border:1px solid rgba(124,92,255,.5);border-radius:8px;padding:16px;
       background:var(--vd);box-shadow:inset 0 0 26px -8px #7C5CFF">
    <div class="lbl" style="color:var(--vg);font-size:10px">Approach</div>
    <div style="margin-top:9px;color:var(--i0);font-size:16px;line-height:1.5">
      All beacons fall silent. There is nothing between you and the
      edge but hull and dark.
    </div>
  </div>

  <div class="bar" style="margin-top:12px;border:1px solid rgba(255,214,160,.35);
       background:rgba(255,214,160,.07);color:var(--g3);align-items:flex-start">
    <span style="line-height:1.5"><b>The final challenge is not in this app.</b><br>
    <span style="color:var(--i3)">Enter the code from the Null Void. A wrong code still costs 15 minutes.</span></span>
  </div>

  <div style="margin-top:auto">
    <div class="lbl" style="margin-bottom:7px;color:var(--vg)">Void Entry Code</div>
    <div class="inp" style="border-color:rgba(124,92,255,.5)">
      <span class="m" style="letter-spacing:.22em">&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;</span>
    </div>
    <div class="btn void" style="margin:12px 0 18px">Cross the Threshold</div>
  </div>
</div>
""" + nav("Journey")

# ---------------------------------------------------------- 15-16 FRAGMENTS
def frag_tile(idx, label, line, unlocked):
    if unlocked:
        return ('<div style="border:1px solid rgba(255,214,160,.34);background:rgba(255,214,160,.05);'
                'border-radius:8px;padding:13px 15px;display:flex;gap:12px;align-items:flex-start">'
                + shard(26) +
                '<div><div class="lbl" style="color:var(--g3);font-size:9px">' + label + '</div>'
                '<div class="m" style="font-size:11.5px;color:var(--g3);line-height:1.6;margin-top:5px">'
                + line + '</div></div></div>')
    return ('<div style="border:1px dashed var(--h4);border-radius:8px;padding:13px 15px;'
            'display:flex;gap:12px;align-items:center;opacity:.75">'
            '<svg width="26" height="26" viewBox="0 0 40 40" fill="none" opacity=".5">'
            '<path d="M20 3l13 9-4.5 18h-17L7 12z" stroke="#4A423E" stroke-width="1.5"/></svg>'
            '<div><div class="lbl" style="font-size:9px;color:var(--i5)">' + label + '</div>'
            '<div style="font-size:11px;color:var(--i5);margin-top:4px">Locked</div></div></div>')

S["FragmentsPartial"] = """
<div class="wrap" style="padding-bottom:74px">
  """ + head_bar("Recovered Data", "Fragments",
                 '<div class="m" style="font-size:14px;color:var(--em);margin-top:14px">2 / 4</div>') + """
  <div style="display:flex;flex-direction:column;gap:11px">
    """ + frag_tile(1, "Fragment I", "firing window logged &mdash; tachyon pulse, scheduled_", True) + """
    """ + frag_tile(2, "Fragment II", "burst signature matches the pulse profile &mdash; unexplained_", True) + """
    """ + frag_tile(3, "Fragment III", "", False) + """
    """ + frag_tile(4, "Fragment IV", "", False) + """
  </div>
  <div class="hint" style="margin-top:16px;font-size:11px">
    Two more to recover before the transmission assembles.
  </div>
</div>
""" + nav("Fragments")

S["FragmentsComplete"] = """
<div class="wrap" style="padding-bottom:74px">
  """ + head_bar("Recovered Data", "Fragments",
                 '<div class="m" style="font-size:14px;color:var(--g3);margin-top:14px">4 / 4</div>') + """
  <div style="display:flex;flex-direction:column;gap:9px">
    """ + frag_tile(1, "Fragment I", "firing window logged &mdash; scheduled_", True) + """
    """ + frag_tile(2, "Fragment II", "burst signature matches the pulse_", True) + """
    """ + frag_tile(3, "Fragment III", "origin bearing resolves inward_", True) + """
    """ + frag_tile(4, "Fragment IV", "authorisation carries this callsign_", True) + """
  </div>
  <div style="margin-top:14px;border:1px solid rgba(240,80,60,.42);background:rgba(240,80,60,.08);
       border-radius:8px;padding:14px 15px">
    <div class="lbl" style="color:var(--fa);font-size:9px">Assembled Transmission</div>
    <div class="m" style="font-size:12px;color:var(--i0);line-height:1.65;margin-top:7px">
      The pulse was already fired. You fired it.
    </div>
    <div style="font-size:11px;color:var(--sg);margin-top:9px">replay the reveal &rarr;</div>
  </div>
</div>
""" + nav("Fragments")

# ---------------------------------------------------------------- 17 LEADERBOARD
def lb_row(rank, name, stops, you=False, void=False):
    dots = ""
    for i in range(5):
        if void and i == 4:
            c = "#7C5CFF"
        elif i < stops:
            c = "#EA6A22"
        else:
            c = "#383230"
        dots += "<span style='width:7px;height:7px;border-radius:50%;background:" + c + "'></span>"
    border = "1px solid var(--r4)" if you else "1px solid var(--h4)"
    chip = ""
    if void:
        chip = ("<span style='font-size:8.5px;letter-spacing:.14em;color:#7C5CFF;"
                "border:1px solid rgba(124,92,255,.5);border-radius:3px;padding:2px 5px'>IN VOID</span>")
    return ('<div style="display:flex;align-items:center;gap:11px;padding:11px 13px;border:' + border +
            ';border-radius:8px;background:var(--h2)">'
            '<span class="m" style="font-size:12px;color:' + ("#EA6A22" if you else "#9A928A") + ';width:18px">'
            + rank + '</span>'
            '<div style="flex:1;min-width:0"><div style="font-size:13.5px;color:var(--i0);'
            'white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + name + '</div>'
            '<div style="display:flex;gap:4px;margin-top:6px">' + dots + '</div></div>' + chip + '</div>')

S["Leaderboard"] = """
<div class="wrap" style="padding-bottom:74px">
  """ + head_bar("Standings", "Ranks",
                 '<div class="hint" style="font-size:10px;margin-top:16px">updated 12s ago</div>') + """
  <div style="display:flex;flex-direction:column;gap:9px">
    """ + lb_row("01", "Sunken Choir", 5, void=True) + """
    """ + lb_row("02", "The Nightjar", 3, you=True) + """
    """ + lb_row("03", "Ashfall", 3) + """
    """ + lb_row("04", "Quiet Machine", 2) + """
    """ + lb_row("05", "Paper Comet", 2) + """
    """ + lb_row("06", "Hollow Bell", 1) + """
  </div>
  <div class="hint" style="margin-top:14px;font-size:11px;text-align:center">
    Ranked by stops cleared, then by who got there first.
  </div>
</div>
""" + nav("Ranks")

# ---------------------------------------------------------------- 18 FINISHED
S["Finished"] = """
<div class="wrap" style="align-items:center;text-align:center;justify-content:center">
  <svg width="76" height="76" viewBox="0 0 40 40" fill="none">
    <path d="M32 12a15 15 0 10-3 20" stroke="#7C5CFF" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M29 32l4-9-9 2" stroke="#7C5CFF" stroke-width="1.1" stroke-opacity=".6" stroke-linejoin="round"/>
  </svg>
  <div class="d" style="font-size:38px;color:var(--vg);margin-top:20px">You&rsquo;re inside</div>
  <div style="color:var(--i1);font-size:16px;line-height:1.55;margin-top:12px">
    The pulse is armed. The rest happens here, not on this screen.
  </div>
  <div class="plate" style="margin-top:22px;width:100%;border-color:rgba(124,92,255,.35)">
    <div class="lbl" style="color:var(--vg);font-size:10px">Next</div>
    <div style="margin-top:8px;color:var(--i0);font-size:15px;line-height:1.5">
      Find a marshal. The final case study is on paper.
    </div>
  </div>
  <div style="display:flex;gap:10px;width:100%;margin-top:18px">
    <div class="btn ghost" style="flex:1;font-size:11px">Fragments</div>
    <div class="btn ghost" style="flex:1;font-size:11px">Ranks</div>
  </div>
  <div class="hint" style="margin-top:20px;font-size:11px">The Nightjar &middot; 2nd to the Void</div>
</div>
"""

# ---------------------------------------------------------------- 19 404
S["NotFound"] = """
<div class="wrap" style="align-items:center;text-align:center;justify-content:center">
  <svg width="88" height="88" viewBox="0 0 60 60" fill="none" style="transform:rotate(-14deg)">
    <path d="M30 8l9 22-9 7-9-7z" stroke="#4A423E" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M21 30l-6 8 7-1M39 30l6 8-7-1" stroke="#4A423E" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M30 37v9" stroke="#EA6A22" stroke-width="1.2" stroke-dasharray="2 3"/>
  </svg>
  <div class="d" style="font-size:38px;margin-top:22px">Off course</div>
  <div class="hint" style="margin-top:10px">No station at these coordinates.</div>
  <div class="btn" style="width:100%;margin-top:26px">Back to the Journey</div>
</div>
"""

# ------------------------------------------------------- 20-22 EDGE STATES
def sk(w, h, mt="0"):
    return ('<div style="width:' + w + ';height:' + h + ';border-radius:5px;background:var(--h3);margin-top:' + mt + '"></div>')

S["StateSkeleton"] = """
<div class="wrap" style="padding-bottom:74px">
  """ + sk("96px", "11px") + sk("100%", "18px", "14px") + """
  <div class="plate" style="margin-top:18px">
    """ + sk("70px", "10px") + sk("100%", "13px", "12px") + sk("100%", "13px", "8px") + sk("62%", "13px", "8px") + sk("100%", "96px", "14px") + """
  </div>
  <div style="margin-top:auto">
    """ + sk("84px", "10px") + sk("100%", "48px", "9px") + sk("100%", "48px", "12px") + """
    <div style="height:18px"></div>
  </div>
</div>
""" + nav("Journey")

S["StateOffline"] = """
<div class="bar" style="position:absolute;top:0;left:0;right:0;z-index:5;border-radius:0;
     border-bottom:1px solid rgba(251,191,36,.4);background:rgba(251,191,36,.13);color:var(--wa);
     justify-content:center">
  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="#FBBF24" stroke-width="1.7">
    <path d="M3 3l14 14M6.5 11.5a5 5 0 016-.8M10 15h.01"/></svg>
  <span>No signal &mdash; showing your last clue.</span>
</div>
<div class="wrap" style="padding-top:52px;padding-bottom:74px">
  <div class="lbl">Stop 2 of 5</div>
  <div style="margin-top:11px">""" + rail(1, 1) + """</div>
  <div class="plate" style="margin-top:16px">
    <div class="lbl" style="color:var(--r4);font-size:10px">Inbound Signal</div>
    <div style="margin-top:9px;color:var(--i0);font-size:16px;line-height:1.5">
      Where the long benches face the water and the third pillar
      carries a scar, the relay still listens.
    </div>
  </div>
  <div style="margin-top:auto">
    <div class="lbl" style="margin-bottom:7px;color:var(--i5)">Station Code</div>
    <div class="inp dim"><span class="m">&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;</span></div>
    <div class="hint" style="margin:9px 0 12px;font-size:11px">Submitting resumes when you reconnect.</div>
    <div class="btn off" style="margin-bottom:18px">Decrypt Signal</div>
  </div>
</div>
""" + nav("Journey")

S["StateRateLimited"] = """
<div class="wrap" style="padding-bottom:74px">
  <div class="lbl">Stop 2 of 5</div>
  <div style="margin-top:11px">""" + rail(1, 1) + """</div>

  <div style="margin-top:14px;border:1px solid rgba(251,191,36,.42);background:rgba(251,191,36,.1);
       border-radius:8px;padding:13px 15px">
    <div style="color:var(--wa);font-size:13px;font-weight:700">Your team has used all 10 attempts</div>
    <div class="hint" style="margin-top:5px;font-size:11.5px">
      The limit is 10 tries per team every 15 minutes &mdash; shared by all four of you.
    </div>
    <div class="m" style="color:var(--wa);font-size:22px;margin-top:10px;letter-spacing:.05em">04:11</div>
  </div>

  <div class="plate" style="margin-top:14px">
    <div class="lbl" style="color:var(--r4);font-size:10px">Inbound Signal</div>
    <div style="margin-top:9px;color:var(--i0);font-size:15px;line-height:1.5">
      Where the long benches face the water and the third pillar
      carries a scar, the relay still listens.
    </div>
  </div>

  <div style="margin-top:auto">
    <div class="inp dim"><span class="m">&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;</span></div>
    <div class="btn off" style="margin:12px 0 18px">Decrypt Signal</div>
  </div>
</div>
""" + nav("Journey")

# ---------------------------------------------------------------- write out
here = os.path.dirname(os.path.abspath(__file__))
for name, body in S.items():
    io.open(os.path.join(here, name + ".dc.html"), "w", encoding="utf-8").write(HEAD + body + TAIL)
print("wrote " + str(len(S)) + " artboards")
print(" ".join(sorted(S.keys())))
