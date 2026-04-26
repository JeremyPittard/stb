# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.1.0] - 2026-04-26

### Features

- Add VITE_SHOW_AD env var to control ad modal display
- Add VITE_USE_DEV_ROLLS and VITE_DEV_ROLLS for deterministic dice rolls in development

### Bug Fixes

- Fix boolean comparison for Vite env vars (must compare to string "true", not boolean true)