"""Hero edit. edit.py <desktop|mobile> <out.mp4> [surf.mp4]
Shots are rendered at the target size, then joined with masked transitions (masks.py)."""
import sys, os, subprocess, shutil
MODE, OUT = sys.argv[1], sys.argv[2]; SURF = sys.argv[3] if len(sys.argv) > 3 else None
FPS = 25
W, H = (1280, 720) if MODE == 'desktop' else (540, 960)
M = 'work/m720' if MODE == 'desktop' else 'work/m540'
WD = f'work/{MODE}'; shutil.rmtree(WD, ignore_errors=True); os.makedirs(WD)
IMG = '/home/claude/WHDemoSite-brand/assets/img/'
DRONE = '/home/claude/WHDemoSite-brand/assets/video/hero.mp4'
def run(args): subprocess.run(['ffmpeg', '-v', 'error', '-y'] + args, check=True)
ENC = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '12', '-pix_fmt', 'yuv420p', '-an', '-r', str(FPS)]
def frames(sec): return round(sec * FPS)

def clip(name, src, start, dur, mob_x=0.5, mob_pan=None):
  """mob_x: centre of the portrait crop (share of width); mob_pan: (from, to) to follow the subject"""
  out = f'{WD}/{name}.mp4'
  if MODE == 'desktop':
    vf = f'scale={W}:{H}:flags=lanczos,fps={FPS},setsar=1'
  else:
    cw = 'ih*9/16'
    if mob_pan:
      a, b = mob_pan; x = f'(iw-{cw})*({a}+({b}-{a})*t/{dur})'
    else:
      x = f'(iw-{cw})*{mob_x}'
    vf = f'crop={cw}:ih:{x}:0,scale={W}:{H}:flags=lanczos,fps={FPS},setsar=1'
  run(['-ss', str(start), '-i', src, '-vf', vf, '-frames:v', str(frames(dur))] + ENC + [out]); return out, dur

def still(name, img, dur, mob_x=0.5, zoom=0.07):
  """slow push-in on a photo"""
  out = f'{WD}/{name}.mp4'; n = frames(dur)
  # crop the photo to the target shape first, upscale 3x so the zoom is smooth
  pre = f'crop=\'min(iw,ih*{W}/{H})\':\'min(ih,iw*{H}/{W})\':\'(iw-min(iw,ih*{W}/{H}))*{mob_x}\':\'(ih-min(ih,iw*{H}/{W}))/2\',scale={W*3}:{H*3}:flags=lanczos'
  zp = f"zoompan=z='1+{zoom}*on/{n}':d={n}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS},setsar=1"
  run(['-loop', '1', '-i', IMG + img, '-vf', pre + ',' + zp, '-frames:v', str(n)] + ENC + [out]); return out, dur

def freeze_first(name, src, dur):
  out = f'{WD}/{name}.mp4'
  if MODE == 'desktop': vf = f'scale={W}:{H}:flags=lanczos'
  else: vf = f'crop=ih*9/16:ih:(iw-ih*9/16)*0.5:0,scale={W}:{H}:flags=lanczos'  # matches clip('drone') crop below
  return out, dur, vf

# --- shot list -----------------------------------------------------------------------------------
# drone portrait crop sits at x=706 of 1920 (as the existing hero-mobile cut) -> share 706/(1920-608)
DX = 706 / (1920 - 608)
shots = [
  (clip('drone', DRONE, 0, 4.2, mob_x=DX),                             'slant'),
  (clip('stadium', 'src/stadium_aerial.mp4', 0.6, 4.4, mob_pan=(0.12, 0.62)), 'wrev'),
  (still('kop', 'wrexham-kop-1600.webp', 3.6, mob_x=0.42),              'slant'),
  (clip('crowd', 'src/crowd.mp4', 4.0, 4.0),                           'wrev'),
]
if SURF:
  shots[-1] = (shots[-1][0], 'slant')
  shots.append((clip('surf', SURF, 1.0, 4.0), 'wrev'))
shots += [
  (still('arena', 'arena-abertawe-1400.webp', 3.6, mob_x=0.5),          'slant'),
  (still('epc', 'brighton-epc-1600.webp', 3.6, mob_x=0.5),              'fade'),
]
# loop: end on the drone's first frame so the restart is seamless
first = f'{WD}/first.mp4'
vf = f'scale={W}:{H}:flags=lanczos' if MODE == 'desktop' else f'crop=ih*9/16:ih:(iw-ih*9/16)*{DX}:0,scale={W}:{H}:flags=lanczos'
run(['-i', DRONE, '-vf', vf + f',fps={FPS},setsar=1', '-frames:v', '1', f'{WD}/first.png'])
run(['-loop', '1', '-i', f'{WD}/first.png', '-vf', 'setsar=1', '-frames:v', str(frames(0.8))] + ENC + [first])
shots.append(((first, 0.8), None))

# fade mask (plain crossfade, 0.8 s)
fd = f'{M}/fade'
if not os.path.isdir(fd):
  from PIL import Image
  os.makedirs(fd); n = frames(0.8)
  for i in range(n): Image.new('L', (W, H), round(255 * (i + 1) / (n + 1))).save(f'{fd}/{i:03d}.png')
TD = {'slant': 0.6, 'wrev': 1.2, 'fade': 0.8}

def merge(a, la, b, lb, kind, out):
  T = TD[kind]; nT = frames(T)
  fc = (f'[0:v]split[a1][a2];[a1]trim=end_frame={frames(la)-nT},setpts=PTS-STARTPTS,setsar=1[ah];'
        f'[a2]trim=start_frame={frames(la)-nT},setpts=PTS-STARTPTS,format=gbrp[at];'
        f'[1:v]split[b1][b2];[b1]trim=end_frame={nT},setpts=PTS-STARTPTS,format=gbrp[bh];'
        f'[b2]trim=start_frame={nT},setpts=PTS-STARTPTS,setsar=1[bt];'
        f'[2:v]format=gray,format=gbrp,setpts=PTS-STARTPTS[m];[at][bh][m]maskedmerge,format=yuv420p,setsar=1[x];'
        f'[ah][x][bt]concat=n=3:v=1:a=0[o]')
  run(['-i', a, '-i', b, '-framerate', str(FPS), '-i', f'{M}/{kind}/%03d.png', '-filter_complex', fc, '-map', '[o]'] + ENC + [out])
  return la + lb - T

(cur, curlen), kind = shots[0]
for k, ((path, ln), nxt) in enumerate(shots[1:], 1):
  o = f'{WD}/join{k}.mp4'; curlen = merge(cur, curlen, path, ln, kind, o); cur = o; kind = nxt
crf = '26' if MODE == 'desktop' else '30'
run(['-i', cur, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', crf, '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', OUT])
print(MODE, 'length', round(curlen, 2), 's ->', OUT, os.path.getsize(OUT) // 1024, 'KB')
