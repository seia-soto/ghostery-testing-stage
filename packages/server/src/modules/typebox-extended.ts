/* eslint-disable new-cap */
import {TypeSystem} from '@sinclair/typebox/system';

export const numeric = TypeSystem.Format('numeric', value => !value.includes('.') && !isNaN(parseInt(value, 10)));
