ALTER TABLE test01 DROP COLUMN test02a;
ALTER TABLE test01 DROP COLUMN test02b;

-- down (notice how there is no "up" marker?) --

ALTER TABLE test01 ADD COLUMN test02a INT;
ALTER TABLE test01 ADD COLUMN test02b VARCHAR(32);

