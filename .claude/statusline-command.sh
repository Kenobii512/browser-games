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
