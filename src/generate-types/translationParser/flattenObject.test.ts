import { describe, it, expect } from 'vitest';
import { flattenObject } from './flattenObject.js';

describe('flattenObject', () => {
  it('должен корректно разворачивать плоский объект', () => {
    const input = {
      message: 'Hello, {name}!',
    };
    const output = flattenObject(input);
    expect(output).toEqual({ message: ['name'] });
  });

  it('должен корректно разворачивать вложенные объекты', () => {
    const input = {
      messages: {
        welcome: 'Hello, {name}! Your ID is {id}.',
      },
    };
    const output = flattenObject(input);
    expect(output).toEqual({ 'messages.welcome': ['name', 'id'] });
  });

  it('должен возвращать пустой объект, если входной объект пуст', () => {
    const input = {};
    const output = flattenObject(input);
    expect(output).toEqual({});
  });

  it('должен корректно обрабатывать строки без параметров', () => {
    const input = {
      message: 'Hello, world!',
    };
    const output = flattenObject(input);
    expect(output).toEqual({ message: [] });
  });

  it('должен игнорировать нестроковые значения', () => {
    const input = {
      user: {
        name: 'John',
        age: 30,
        preferences: null,
        active: true,
      },
    };
    const output = flattenObject(input);
    expect(output).toEqual({ 'user.name': [] });
  });

  it('должен корректно работать с несколькими уровнями вложенности', () => {
    const input = {
      level1: {
        level2: {
          level3: 'Deep {param} inside',
        },
      },
    };
    const output = flattenObject(input);
    expect(output).toEqual({ 'level1.level2.level3': ['param'] });
  });

  it('должен обрабатывать дублирующиеся параметры корректно', () => {
    const input = {
      message: '{user} said hello, {user}!',
    };
    const output = flattenObject(input);
    expect(output).toEqual({ message: ['user', 'user'] }); // Параметры остаются в порядке появления
  });
});
