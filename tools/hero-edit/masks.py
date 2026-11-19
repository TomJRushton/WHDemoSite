"""Transition masks, white = incoming shot. masks.py <W> <H> <fps> <outdir>
slant_<n>: a diagonal edge at the W's stroke angle sweeping left to right (0.6 s)
wrev_<n>:  the incoming still appears inside a growing W, holds, then opens to full frame (1.2 s)"""
import sys, os, math
from PIL import Image, ImageDraw, ImageFilter
W,H,FPS,OUT=int(sys.argv[1]),int(sys.argv[2]),int(sys.argv[3]),sys.argv[4]
os.makedirs(OUT,exist_ok=True)
ease=lambda t: t*t*(3-2*t)
# slant wipe: stroke slope from the logo (dx -21, dy 32.7) -> edge leans right as it rises
SL=21/32.7
n=round(0.6*FPS)
os.makedirs(f'{OUT}/slant',exist_ok=True)
for i in range(n):
  p=ease((i+1)/(n+1)); span=W+H*SL+40
  x=-H*SL-20+p*span
  im=Image.new('L',(W,H),0); d=ImageDraw.Draw(im)
  d.polygon([(0,0),(x+H*SL,0),(x,H),(0,H)],fill=255)
  im.filter(ImageFilter.GaussianBlur(max(1,W/640))).save(f'{OUT}/slant/{i:03d}.png')
# W reveal
Wsrc=Image.open('/home/claude/vid/work/w-2400.png').convert('L')
n=round(1.2*FPS)
os.makedirs(f'{OUT}/wrev',exist_ok=True)
for i in range(n):
  t=(i+1)/(n+1)
  grow=ease(min(1,t/0.55)); s=0.25+0.55*grow          # W height as share of frame height
  fill=ease(max(0,(t-0.62)/0.38))                     # then the whole frame fades in
  base=min(H, W*0.92*Wsrc.height/Wsrc.width)            # fit the W to the frame's narrower side (phones)
  hgt=int(base*s/0.8); wid=int(hgt*Wsrc.width/Wsrc.height)
  wm=Wsrc.resize((max(1,wid),max(1,hgt)),Image.LANCZOS)
  im=Image.new('L',(W,H),0); im.paste(wm,((W-wid)//2,(H-hgt)//2))
  if fill>0: im=Image.blend(im,Image.new('L',(W,H),255),fill)
  im.save(f'{OUT}/wrev/{i:03d}.png')
print('masks ok',W,H)
