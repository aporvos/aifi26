import { describe, expect, test } from 'vitest';
import {
  buildShareUrl,
  decodeFavorites,
  encodeFavorites,
  filterValidIds,
  parseShareUrl,
} from '../src/lib/url-favorites.js';

describe('encodeFavorites · decodeFavorites round-trip', () => {
  test('round-trip preserva el orden', () => {
    const ids = ['09-30-pacifico', '14-00-pacifico', '14-00-atlantico-c'];
    const encoded = encodeFavorites(ids);
    expect(encoded).toBe('09-30-pacifico,14-00-pacifico,14-00-atlantico-c');
    expect(decodeFavorites(encoded)).toEqual(ids);
  });

  test('array vacío encodea a string vacío y decodea a vacío', () => {
    expect(encodeFavorites([])).toBe('');
    expect(decodeFavorites('')).toEqual([]);
  });

  test('dedupe en encode', () => {
    expect(encodeFavorites(['a', 'b', 'a', 'c', 'b'])).toBe('a,b,c');
  });

  test('dedupe en decode', () => {
    expect(decodeFavorites('a,a,b,b,c')).toEqual(['a', 'b', 'c']);
  });

  test('null y undefined manejados gracefully', () => {
    expect(decodeFavorites(null)).toEqual([]);
    expect(decodeFavorites(undefined)).toEqual([]);
  });

  test('whitespace y items vacíos filtrados', () => {
    expect(decodeFavorites('a, b ,  ,c,')).toEqual(['a', 'b', 'c']);
  });
});

describe('filterValidIds', () => {
  test('filtra IDs inexistentes', () => {
    const all = new Set(['a', 'b', 'c']);
    expect(filterValidIds(['a', 'xxx', 'b', 'yyy'], all)).toEqual(['a', 'b']);
  });

  test('acepta array de IDs válidos', () => {
    expect(filterValidIds(['a', 'b', 'c'], ['a', 'c'])).toEqual(['a', 'c']);
  });

  test('todos inválidos → array vacío', () => {
    expect(filterValidIds(['x', 'y'], new Set(['a']))).toEqual([]);
  });
});

describe('buildShareUrl', () => {
  test('genera URL con query string s', () => {
    const url = buildShareUrl('https://aifi26.app', ['a', 'b', 'c']);
    expect(url).toBe('https://aifi26.app/mi-dia?s=a%2Cb%2Cc');
  });

  test('array vacío genera URL sin query', () => {
    expect(buildShareUrl('https://aifi26.app', [])).toBe('https://aifi26.app/mi-dia');
  });

  test('path custom respetado', () => {
    expect(buildShareUrl('https://aifi26.app', ['a'], '/dia')).toBe('https://aifi26.app/dia?s=a');
  });
});

describe('parseShareUrl', () => {
  test('extrae IDs del query string', () => {
    expect(parseShareUrl('https://aifi26.app/mi-dia?s=a,b,c')).toEqual(['a', 'b', 'c']);
  });

  test('URL sin query devuelve array vacío', () => {
    expect(parseShareUrl('https://aifi26.app/mi-dia')).toEqual([]);
  });

  test('URL inválida no crashea', () => {
    expect(parseShareUrl('not-a-url')).toEqual([]);
  });

  test('IDs URL-encoded son decodificados', () => {
    expect(parseShareUrl('https://aifi26.app/mi-dia?s=a%2Cb%2Cc')).toEqual(['a', 'b', 'c']);
  });
});
