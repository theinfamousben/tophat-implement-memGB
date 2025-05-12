// Copyright (C) 2024 Todd Kulesza <todd@dropline.net>

// This file is part of TopHat.

// TopHat is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// TopHat is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with TopHat. If not, see <https://www.gnu.org/licenses/>.

import Gio from 'gi://Gio';

export enum DisplayType {
  Chart,
  Numeric,
  Both,
}

export enum DisplayUnit {
  Percentage,
  Megabytes,
  Gigabytes,
  Mebibytes,
  Gibibytes,
}

export const ONE_MB_IN_B = 1000000;
const TEN_MB_IN_B = 10000000;
export const ONE_GB_IN_B = 1000000000;
const TEN_GB_IN_B = 10000000000;
const ONE_TB_IN_B = 1000000000000;
const TEN_TB_IN_B = 10000000000000;

export const ONE_MIB_IN_B = 1048576;
const TEN_MIB_IN_B = 10485760;
export const ONE_GIB_IN_B = 1073741824;
const TEN_GIB_IN_B = 10737418240;
const ONE_TIB_IN_B = 1099511627776;
const TEN_TIB_IN_B = 10995116277760;

const RE_DF_IS_DISK = /^\s*\/dev\/(\S+)(.*)$/;
const RE_DF_DISK_USAGE = /^\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+%)\s+(.*)$/;

export function GBytesToHumanString(gb: number): string {
  return bytesToHumanString(gb * ONE_GB_IN_B);
}

Gio._promisify(Gio.Subprocess.prototype, 'communicate_utf8_async');

/**
 * Convert a number of bytes to a more logical human-readable string (e.g., 1024 -> 1 K).
 *
 * @param {number} bytes - Number of bytes to convert
 * @param {string} [unit='bytes']  - Either bytes or bits
 * @param {boolean} [imprecise=false] - Reduce precision to 0
 */
export function bytesToHumanString(
  bytes: number,
  unit: string = 'bytes',
  imprecise: boolean = false
): string {
  let quantity = bytes;
  let precision = 1;
  if (imprecise) {
    precision = 0;
  }
  let suffix = 'B';
  if (unit === 'bits') {
    quantity *= 8;
    suffix = 'b';
  }
  if (quantity < 1) {
    return `0 K${suffix}`;
  } else if (quantity < 1000) {
    // Indicate activity, but don't clutter the UI w/ # of bytes
    return `< 1 K${suffix}`;
  } else if (quantity < ONE_MB_IN_B) {
    return `${(quantity / 1000).toFixed(0)} K${suffix}`;
  } else if (quantity < TEN_MB_IN_B) {
    // Show one decimal of precision for < 100 MB
    return `${(quantity / ONE_MB_IN_B).toFixed(precision)} M${suffix}`;
  } else if (quantity < ONE_GB_IN_B) {
    return `${(quantity / ONE_MB_IN_B).toFixed(0)} M${suffix}`;
  } else if (quantity < TEN_GB_IN_B) {
    return `${(quantity / ONE_GB_IN_B).toFixed(precision)} G${suffix}`;
  } else if (quantity < ONE_TB_IN_B) {
    return `${(quantity / ONE_GB_IN_B).toFixed(0)} G${suffix}`;
  } else if (quantity < TEN_TB_IN_B) {
    return `${(quantity / ONE_TB_IN_B).toFixed(precision)} T${suffix}`;
  } else {
    return `${(quantity / ONE_TB_IN_B).toFixed(0)} T${suffix}`;
  }
}

export function binaryBytesToHumanString(
  bytes: number,
  unit: string = 'bytes',
  imprecise: boolean = false
): string {
  let quantity = bytes;
  let precision = 1;
  if (imprecise) {
    precision = 0;
  }
  let suffix = 'B';
  if (unit === 'bits') {
    quantity *= 8;
    suffix = 'b';
  }
  if (quantity < 1) {
    return `0 K${suffix}`;
  } else if (quantity < 1000) {
    // Indicate activity, but don't clutter the UI w/ # of bytes
    return `< 1 K${suffix}`;
  } else if (quantity < ONE_MIB_IN_B) {
    return `${(quantity / 1000).toFixed(0)} K${suffix}`;
  } else if (quantity < TEN_MIB_IN_B) {
    // Show one decimal of precision for < 100 MB
    return `${(quantity / ONE_MIB_IN_B).toFixed(precision)} Mi${suffix}`;
  } else if (quantity < ONE_GIB_IN_B) {
    return `${(quantity / ONE_MIB_IN_B).toFixed(0)} Mi${suffix}`;
  } else if (quantity < TEN_GIB_IN_B) {
    return `${(quantity / ONE_GIB_IN_B).toFixed(precision)} Gi${suffix}`;
  } else if (quantity < ONE_TIB_IN_B) {
    return `${(quantity / ONE_GIB_IN_B).toFixed(0)} Gi${suffix}`;
  } else if (quantity < TEN_TIB_IN_B) {
    return `${(quantity / ONE_TIB_IN_B).toFixed(precision)} Ti${suffix}`;
  } else {
    return `${(quantity / ONE_TIB_IN_B).toFixed(0)} Ti${suffix}`;
  }
}

/**
 * Round up to the nearest power of 10 (or half that).
 *
 * @param {number} bytes - Value of bytes to round
 */
export function roundMax(bytes: number) {
  let result = Math.pow(10, Math.ceil(Math.log10(bytes)));
  while (result / 2 > bytes && result > 20000) {
    result /= 2;
  }
  return result;
}

export function getDisplayTypeSetting(settings: Gio.Settings, key: string) {
  let t = DisplayType.Both;
  switch (settings.get_string(key)) {
    case 'chart':
      t = DisplayType.Chart;
      break;
    case 'numeric':
      t = DisplayType.Numeric;
      break;
    case 'both':
      t = DisplayType.Both;
      break;
  }
  return t;
}

export function getDisplayUnitsSetting(settings: Gio.Settings, key: string) {
  let t = DisplayUnit.Percentage;
  switch (settings.get_string(key)) {
    case 'percentage':
      t = DisplayUnit.Percentage;
      break;
    case 'megabytes':
      t = DisplayUnit.Megabytes;
      break;
    case 'gigabytes':
      t = DisplayUnit.Gigabytes;
      break;
    case 'mebibytes':
      t = DisplayUnit.Mebibytes;
      break;
    case 'gibibytes':
      t = DisplayUnit.Gibibytes;
      break;
  }
  return t;
}

export class FSUsage {
  public dev;
  public cap;
  public used;
  public mount;

  constructor(dev = '', cap = 0, used = 0, mount = '') {
    this.dev = dev;
    this.cap = cap;
    this.used = used;
    this.mount = mount;
  }

  public usage() {
    return Math.round((this.used / this.cap) * 100);
  }
}

export async function readFileSystems(): Promise<FSUsage[]> {
  return new Promise<FSUsage[]>((resolve, reject) => {
    const fileSystems = new Map<string, FSUsage>();
    try {
      const proc = Gio.Subprocess.new(
        ['df', '-P'],
        Gio.SubprocessFlags.STDOUT_PIPE
      );
      proc.communicate_utf8_async(null, null).then(([stdout]) => {
        if (proc.get_successful()) {
          const output = stdout as unknown as string;
          const lines = output.split('\n');
          for (const line of lines) {
            const m = line.match(RE_DF_IS_DISK);
            if (m) {
              const details = m[2].match(RE_DF_DISK_USAGE);
              if (details) {
                const dev = m[1];
                const cap = parseInt(details[1]) * 1024;
                const used = parseInt(details[2]) * 1024;
                const mount = details[5];
                let fileSystem = new FSUsage(dev, cap, used, mount);
                if (fileSystems.has(dev)) {
                  const old = fileSystems.get(dev);
                  if (old && old.mount.length < mount.length) {
                    // Only report one mount per device; use the shortest file path
                    fileSystem = old;
                  }
                }
                fileSystems.set(dev, fileSystem);
              }
            }
          }
          resolve(Array.from(fileSystems.values()));
          return;
        } else {
          console.warn('[TopHat] Could not run df -P: ');
          reject('Could not run df -P');
          return;
        }
      });
    } catch (e) {
      console.warn('[TopHat] Could not run df -P: ' + e);
      reject('Could not run df -P');
      return;
    }
  });
}
