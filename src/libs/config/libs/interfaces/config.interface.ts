import { type EnvironmentSchema } from '../types/types.js';
import { type ILibraryConfig } from './interfaces.js';

interface IConfig extends ILibraryConfig<EnvironmentSchema> {}

export { type IConfig };
