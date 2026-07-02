import assert from 'node:assert/strict';
import test from 'node:test';
import { getProductUrgency } from './product-urgency.mjs';

const now = Date.parse('2026-07-01T12:00:00Z');

test('clasifica 59 minutos como Urgente', () => {
  assert.equal(getProductUrgency(now + 59 * 60 * 1000, now).key, 'urgent');
});

test('clasifica exactamente 1 hora como Pronto', () => {
  assert.equal(getProductUrgency(now + 60 * 60 * 1000, now).key, 'soon');
});

test('clasifica exactamente 3 horas como Pronto', () => {
  assert.equal(getProductUrgency(now + 3 * 60 * 60 * 1000, now).key, 'soon');
});

test('clasifica más de 3 horas como Disponible', () => {
  assert.equal(getProductUrgency(now + 181 * 60 * 1000, now).key, 'available');
});
