import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Toggle } from '../Toggle';
import { ToggleGroup, ToggleGroupItem } from '../ToggleGroup';
import { Slider } from '../Slider';
import { Textarea } from '../Textarea';

describe('New Form Components', () => {
  it('renders Toggle component', () => {
    const { container } = render(<Toggle>Toggle Me</Toggle>);
    expect(container.firstChild).toBeDefined();
  });

  it('renders ToggleGroup with items', () => {
    const { container } = render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
        <ToggleGroupItem value="c">C</ToggleGroupItem>
      </ToggleGroup>
    );
    expect(container.firstChild).toBeDefined();
  });

  it('renders Slider component', () => {
    const { container } = render(<Slider defaultValue={[50]} max={100} step={1} />);
    expect(container.firstChild).toBeDefined();
  });

  it('renders Textarea component', () => {
    const { container } = render(<Textarea placeholder="Type your message..." />);
    expect(container.firstChild).toBeDefined();
  });
});