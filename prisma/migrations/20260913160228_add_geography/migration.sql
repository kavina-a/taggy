-- GiST index on the geography column for future spatial queries (Phase 2
-- SRCH-03 distance filter / SRCH-05 geo-decay ranking).
CREATE INDEX "Business_location_gist" ON "Business" USING GIST ("location");

-- Keeps `location` in sync with `latitude`/`longitude` server-side so the
-- application never writes to the geography column directly. Static DDL,
-- never built from request/user input (see 01-01-PLAN.md threat T-01-01).
CREATE OR REPLACE FUNCTION sync_business_location() RETURNS trigger AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_location_sync
BEFORE INSERT OR UPDATE OF latitude, longitude ON "Business"
FOR EACH ROW EXECUTE FUNCTION sync_business_location();
