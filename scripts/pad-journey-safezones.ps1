Add-Type -AssemblyName System.Drawing

# Exact match: 100px empty top + 100px empty bottom. Graphics fill the middle flush.
$ErrorActionPreference = "Stop"
$dstDir = "D:\App Development\academy\assets"
$cursor = "C:\Users\Riyaz Hossain\.cursor\projects\d-App-Development-academy\assets"
$SAFE = 100

$sources = [ordered]@{
  "journey-coach.jpg"     = "$cursor\journey-coach-gen.jpg"
  "journey-parent.jpg"    = "$cursor\journey-parent-gen.jpg"
  "journey-support.jpg"   = "$cursor\journey-support-gen.jpg"
  "journey-education.jpg" = "$cursor\journey-education-gen.jpg"
  "journey-discover.jpg"  = "$cursor\journey-discover-gen.jpg"
}

function Test-WhiteUi([System.Drawing.Color]$c) {
  return ($c.R -gt 200 -and $c.G -gt 200 -and $c.B -gt 200 -and
          [Math]::Abs([int]$c.R - [int]$c.G) -lt 35 -and
          [Math]::Abs([int]$c.G - [int]$c.B) -lt 35)
}

function Get-WhiteUiBounds([System.Drawing.Bitmap]$src) {
  $w = $src.Width; $h = $src.Height
  $threshold = [Math]::Max(6, [int]($w / 80))
  $minY = -1; $maxY = -1
  for ($y = 0; $y -lt $h; $y += 2) {
    $hits = 0
    for ($x = 0; $x -lt $w; $x += 3) {
      if (Test-WhiteUi ($src.GetPixel($x, $y))) { $hits++ }
    }
    if ($hits -ge $threshold) {
      if ($minY -lt 0) { $minY = $y }
      $maxY = $y
    }
  }
  if ($minY -lt 0) { return @{ L = 0; T = 0; W = $w; H = $h } }
  $pad = 8
  $T = [Math]::Max(0, $minY - $pad)
  $B = [Math]::Min($h - 1, $maxY + $pad)
  return @{ L = 0; T = $T; W = $w; H = ($B - $T + 1) }
}

foreach ($name in $sources.Keys) {
  $src = New-Object System.Drawing.Bitmap $sources[$name]
  $box = Get-WhiteUiBounds $src

  $outW = 720; $outH = 1280
  $topPad = $SAFE; $botPad = $SAFE
  $midH = $outH - $topPad - $botPad

  $skyY = [Math]::Max(2, $box.T - 4)
  $skyL = $src.GetPixel([int]($src.Width * 0.18), $skyY)
  $skyR = $src.GetPixel([int]($src.Width * 0.82), $skyY)
  if (($skyL.R + $skyL.G + $skyL.B) -gt 700) { $skyL = [System.Drawing.Color]::FromArgb(255, 40, 55, 90) }
  if (($skyR.R + $skyR.G + $skyR.B) -gt 700) { $skyR = [System.Drawing.Color]::FromArgb(255, 25, 40, 80) }
  # Use darker sky for top band so it doesn't look like a huge bright bar vs dark bottom
  $skyTop = [System.Drawing.Color]::FromArgb(255,
    [int](($skyL.R + $skyR.R) / 2 * 0.55 + 20),
    [int](($skyL.G + $skyR.G) / 2 * 0.55 + 25),
    [int](($skyL.B + $skyR.B) / 2 * 0.7 + 35))

  $gY = [Math]::Min($src.Height - 2, $box.T + $box.H + 4)
  $ground = $src.GetPixel([int]($src.Width * 0.5), $gY)
  if (($ground.R + $ground.G + $ground.B) -gt 400) {
    $ground = [System.Drawing.Color]::FromArgb(255, 12, 18, 28)
  }
  # Match bottom band visual weight to top (same darkness family)
  $botTone = [System.Drawing.Color]::FromArgb(255,
    [Math]::Min($ground.R, $skyTop.R),
    [Math]::Min($ground.G, $skyTop.G),
    [Math]::Min($ground.B, $skyTop.B + 10))

  $out = New-Object System.Drawing.Bitmap $outW, $outH
  $g = [System.Drawing.Graphics]::FromImage($out)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  # Fill entire canvas with bottom tone first
  $g.Clear($botTone)

  # Graphics FLUSH-FILL the middle band (exact midH) so empty top==bottom==100px
  $scale = $midH / [double]$box.H
  $drawW = [int]([Math]::Ceiling($box.W * $scale))
  $drawH = $midH
  $drawX = [int]([Math]::Floor(($outW - $drawW) / 2.0))
  $drawY = $topPad

  $srcRect = New-Object System.Drawing.Rectangle $box.L, $box.T, $box.W, $box.H
  $destRect = New-Object System.Drawing.Rectangle $drawX, $drawY, $drawW, $drawH
  $g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

  # Side fill if needed
  if ($drawX -gt 0) {
    $ls = New-Object System.Drawing.Rectangle $drawX, $drawY, 1, $drawH
    $g.DrawImage($out, (New-Object System.Drawing.Rectangle 0, $drawY, $drawX, $drawH), $ls, [System.Drawing.GraphicsUnit]::Pixel)
    $rw = $outW - $drawX - $drawW
    if ($rw -gt 0) {
      $rs = New-Object System.Drawing.Rectangle ($drawX + $drawW - 1), $drawY, 1, $drawH
      $g.DrawImage($out, (New-Object System.Drawing.Rectangle ($drawX + $drawW), $drawY, $rw, $drawH), $rs, [System.Drawing.GraphicsUnit]::Pixel)
    }
  }

  # Exact equal empty zones — same height, similar dark tone (no bright top bar)
  $topBrush = New-Object System.Drawing.SolidBrush -ArgumentList @($skyTop)
  $botBrush = New-Object System.Drawing.SolidBrush -ArgumentList @($botTone)
  $g.FillRectangle($topBrush, 0, 0, $outW, $topPad)
  $g.FillRectangle($botBrush, 0, ($outH - $botPad), $outW, $botPad)
  $topBrush.Dispose(); $botBrush.Dispose()

  $g.Dispose(); $src.Dispose()

  $dst = Join-Path $dstDir $name
  $tmp = Join-Path $env:TEMP ("flush-" + [guid]::NewGuid().ToString() + ".jpg")
  $out.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $out.Dispose()
  Copy-Item $tmp $dst -Force
  Remove-Item $tmp -Force

  # Fast verify: sample every 4th row
  $v = New-Object System.Drawing.Bitmap $dst
  $first = -1; $last = -1
  $th = 4
  for ($y = 0; $y -lt $outH; $y += 2) {
    $hits = 0
    for ($x = 0; $x -lt $outW; $x += 4) {
      if (Test-WhiteUi ($v.GetPixel($x, $y))) { $hits++ }
    }
    if ($hits -ge $th) {
      if ($first -lt 0) { $first = $y }
      $last = $y
    }
  }
  $st = $first; $sb = ($outH - 1) - $last
  $v.Dispose()
  Write-Host ("OK {0} spaceTop={1} spaceBot={2} diff={3} (target ~{4})" -f $name, $st, $sb, [Math]::Abs($st-$sb), $SAFE)
}
Write-Host "DONE"
