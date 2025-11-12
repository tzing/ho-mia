import { TotalGrid } from './TotalGrid.js';
import { OuterGrid } from './OuterGrid.js';
import { HeavenGrid } from './HeavenGrid.js';
import { EarthGrid } from './EarthGrid.js';
import { PersonalityGrid } from './PersonalityGrid.js';

export function createDefaultGrids() {
    return [
        new TotalGrid(),
        new HeavenGrid(),
        new EarthGrid(),
        new PersonalityGrid(),
        new OuterGrid()
    ];
}

export { Grid } from './Grid.js';


