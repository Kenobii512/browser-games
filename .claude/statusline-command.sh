#!/usr/bin/env bash
# Claude Code status line script

input=$(cat)

# Model display name
model=$(echo "$input" | jq -r '.model.display_name // "Claude"')

# Current working directory (shorten home to ~)
cwd=$(echo "$input" | jq -r '.cwd // .workspace.current_dir // ""')
if [ -n "$HOME" ]; then
  cwd="${cwd/#$HOME/~}"
fi

# Git branch
branch=""
raw_cwd=$(echo "$input" | jq -r '.cwd // .workspace.current_dir // ""')
if [ -n "$raw_cwd" ] && git -C "$raw_cwd" -c core.fsmonitor=false rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  branch=$(git -C "$raw_cwd" -c core.fsmonitor=false symbolic-ref --short HEAD 2>/dev/null \
           || git -C "$raw_cwd" -c core.fsmonitor=false rev-parse --short HEAD 2>/dev/null)
fi

# Context window remaining percentage
remaining=$(echo "$input" | jq -r '.context_window.remaining_percentage // empty')

# GitHub repo
repo=$(echo "$input" | jq -r '.workspace.repo | if . then .owner + "/" + .name else empty end')

# Rate limit (5-hour window used %)
rate_used=$(echo "$input" | jq -r '.rate_limits.five_hour.used_percentage // empty')

# PR status
pr_number=$(echo "$input" | jq -r '.pr.number // empty')
pr_state=$(echo "$input" | jq -r '.pr.review_state // empty')

# Build output
out=""

# Model (cyan)
out="${out}$(printf '\033[0;36m%s\033[0m' "$model")"

# Repo or directory (yellow)
if [ -n "$repo" ]; then
  out="${out} $(printf '\033[0;33m%s\033[0m' "$repo")"
else
  out="${out} $(printf '\033[0;33m%s\033[0m' "$cwd")"
fi

# Git branch (green)
if [ -n "$branch" ]; then
  out="${out} $(printf '\033[0;32m(%s)\033[0m' "$branch")"
fi

# PR status
if [ -n "$pr_number" ]; then
  case "$pr_state" in
    approved)         pr_color='\033[0;32m' ;;  # green
    changes_requested) pr_color='\033[0;31m' ;; # red
    draft)            pr_color='\033[0;90m' ;;  # dark gray
    *)                pr_color='\033[0;33m' ;;  # yellow (pending/unknown)
  esac
  out="${out} $(printf "${pr_color}PR#%s %s\033[0m" "$pr_number" "$pr_state")"
fi

# Rate limit 5-hour used (green/yellow/red)
if [ -n "$rate_used" ]; then
  rate_int=$(printf '%.0f' "$rate_used")
  if [ "$rate_int" -ge 80 ]; then
    rate_color='\033[0;31m'
  elif [ "$rate_int" -ge 50 ]; then
    rate_color='\033[0;33m'
  else
    rate_color='\033[0;32m'
  fi
  out="${out} $(printf "${rate_color}rl:%d%%\033[0m" "$rate_int")"
fi

# Context remaining (green/yellow/red depending on level)
if [ -n "$remaining" ]; then
  remaining_int=$(printf '%.0f' "$remaining")
  if [ "$remaining_int" -le 20 ]; then
    color='\033[0;31m'
  elif [ "$remaining_int" -le 50 ]; then
    color='\033[0;33m'
  else
    color='\033[0;32m'
  fi
  out="${out} $(printf "${color}ctx:%d%%\033[0m" "$remaining_int")"
fi

printf '%s' "$out"
