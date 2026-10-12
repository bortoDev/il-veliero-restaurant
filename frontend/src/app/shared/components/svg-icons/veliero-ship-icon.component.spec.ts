import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VelieroShipComponent } from './veliero-ship-icon.component';
import { VELIERO_ENGRAVING_PATH, VELIERO_ALL_SAILS_PATH } from './veliero-ship-paths';

describe('VelieroShipComponent', () => {
  let component: VelieroShipComponent;
  let fixture: ComponentFixture<VelieroShipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VelieroShipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VelieroShipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the standalone component', () => {
    expect(component).toBeTruthy();
  });

  it('should render pure inline SVG with calibrated viewBox 390 40 1260 1410', () => {
    const el: HTMLElement = fixture.nativeElement;
    const svg = el.querySelector('svg.veliero-ship-svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('viewBox')).toBe('390 40 1260 1410');
    expect(svg?.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet');
  });

  it('should render dual-layer architecture (sails under-layer and structure top-layer)', () => {
    const el: HTMLElement = fixture.nativeElement;
    const sailsGroup = el.querySelector('g.veliero-sails');
    const structureGroup = el.querySelector('g.veliero-structure');

    expect(sailsGroup).toBeTruthy();
    expect(structureGroup).toBeTruthy();

    const sailPaths = sailsGroup?.querySelectorAll('path');
    const structurePath = structureGroup?.querySelector('path');

    expect(sailPaths?.length).toBeGreaterThan(0);
    expect(sailPaths?.[0]?.getAttribute('d')).toBe(component.sailParts[0]);
    expect(structurePath?.getAttribute('d')).toBe(VELIERO_ENGRAVING_PATH);
  });

  it('should resolve default mode to currentColor structure and white sails', () => {
    component.mode = 'default';
    expect(component.effectivePrimaryColor).toBe('currentColor');
    expect(component.effectiveSailColor).toBe('#FFFFFF');
  });

  it('should resolve gold/brass mode to #EAB308 primary and #FFFFFF sail', () => {
    component.mode = 'gold';
    expect(component.effectivePrimaryColor).toBe('#EAB308');
    expect(component.effectiveSailColor).toBe('#FFFFFF');

    component.mode = 'brass';
    expect(component.effectivePrimaryColor).toBe('#EAB308');
    expect(component.effectiveSailColor).toBe('#FFFFFF');
  });

  it('should resolve ivory/white mode to #F1F5F9 primary and rgba(255,255,255,0.95) sail', () => {
    component.mode = 'ivory';
    expect(component.effectivePrimaryColor).toBe('#F1F5F9');
    expect(component.effectiveSailColor).toBe('rgba(255, 255, 255, 0.95)');

    component.mode = 'white';
    expect(component.effectivePrimaryColor).toBe('#F1F5F9');
    expect(component.effectiveSailColor).toBe('rgba(255, 255, 255, 0.95)');
  });

  it('should resolve navy mode to #1E293B primary and #F1F5F9 sail', () => {
    component.mode = 'navy';
    expect(component.effectivePrimaryColor).toBe('#1E293B');
    expect(component.effectiveSailColor).toBe('#F1F5F9');
  });

  it('should resolve charcoal/monochrome mode to #1E293B primary and #FFFFFF sail', () => {
    component.mode = 'charcoal';
    expect(component.effectivePrimaryColor).toBe('#1E293B');
    expect(component.effectiveSailColor).toBe('#FFFFFF');

    component.mode = 'monochrome';
    expect(component.effectivePrimaryColor).toBe('#1E293B');
    expect(component.effectiveSailColor).toBe('#FFFFFF');
  });

  it('should resolve original mode to currentColor primary and transparent sail', () => {
    component.mode = 'original';
    expect(component.effectivePrimaryColor).toBe('currentColor');
    expect(component.effectiveSailColor).toBe('transparent');
  });

  it('should prioritize explicit primaryColor and sailColor inputs over mode preset', () => {
    component.mode = 'gold';
    component.primaryColor = '#123456';
    component.sailColor = '#ABCDEF';

    expect(component.effectivePrimaryColor).toBe('#123456');
    expect(component.effectiveSailColor).toBe('#ABCDEF');
  });

  it('should handle percentage size input without collapsing aspect ratio', () => {
    component.size = '100%';
    expect(component.computedWidth).toBe('100%');
    expect(component.computedHeight).toBe('auto');
  });

  it('should prioritize explicit width and height inputs over size', () => {
    component.size = '200px';
    component.width = '350px';
    component.height = '400px';

    expect(component.computedWidth).toBe('350px');
    expect(component.computedHeight).toBe('400px');
  });
});
