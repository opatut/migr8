title: 'Test 02-A'
description: 'this is the description for test02b'
author: 'foo bar'

-- UP --

ALTER TABLE test01 ADD COLUMN test02b VARCHAR(32);

-- DOWN --

ALTER TABLE test01 DROP COLUMN test02a;
