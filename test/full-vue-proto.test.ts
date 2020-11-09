import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as FullVueProto from '../lib/full-vue-proto-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new FullVueProto.FullVueProtoStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
