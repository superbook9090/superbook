import { describe, it, expect } from 'vitest';
import {
  parseVersion,
  compareVersions,
  isUpdateAvailable,
  isForceUpdateRequired,
} from '../mobile/versionCompare';
import { extractVersionFromUserAgent } from '../mobile/appVersion';

describe('versionCompare', () => {
  it('parses version strings properly', () => {
    expect(parseVersion('1.2.3')).toEqual([1, 2, 3]);
    expect(parseVersion('v2.0.1')).toEqual([2, 0, 1]);
    expect(parseVersion('1.0')).toEqual([1, 0]);
    expect(parseVersion(null)).toEqual([0]);
    expect(parseVersion('')).toEqual([0]);
  });

  it('compares semantic versions correctly', () => {
    expect(compareVersions('1.0.0', '1.0.1')).toBe(-1);
    expect(compareVersions('1.2.0', '1.1.9')).toBe(1);
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
    expect(compareVersions('1.0', '1.0.0')).toBe(0);
    expect(compareVersions('2.0.0', '1.9.9')).toBe(1);
    expect(compareVersions('0.9.5', '1.0.0')).toBe(-1);
  });

  it('determines if update is available', () => {
    expect(isUpdateAvailable('1.0.0', '1.0.1')).toBe(true);
    expect(isUpdateAvailable('1.1.0', '1.0.1')).toBe(false);
    expect(isUpdateAvailable('1.0.0', '1.0.0')).toBe(false);
    expect(isUpdateAvailable('1.0.0', null)).toBe(false);
  });

  it('determines if force update is required', () => {
    // Force flag enabled
    expect(isForceUpdateRequired('2.0.0', '1.0.0', true)).toBe(true);

    // Current version below min required version
    expect(isForceUpdateRequired('1.0.0', '1.1.0', false)).toBe(true);
    expect(isForceUpdateRequired('1.1.0', '1.1.0', false)).toBe(false);
    expect(isForceUpdateRequired('1.2.0', '1.1.0', false)).toBe(false);
  });

  it('extracts version from user agent', () => {
    expect(extractVersionFromUserAgent('Mozilla/5.0 QuizdoApp/1.4.2 Android')).toBe('1.4.2');
    expect(extractVersionFromUserAgent('QuizdoNativeApp/2.0.0-beta')).toBe('2.0.0');
    expect(extractVersionFromUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_5)')).toBeNull();
  });
});
