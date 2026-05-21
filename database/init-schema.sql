-- 第一步：彻底删除 sciencet schema（连里面的表、序列、权限全炸）
-- 为防止误操作，该SQL注释掉，只有初始化时才使用！
-- DROP SCHEMA IF EXISTS sciencet CASCADE;

-- 第二步：重新创建干净的 sciencet schema
CREATE SCHEMA sciencet;

-- 第三步：把所有权给 postgres（防止任何权限问题）
ALTER SCHEMA sciencet OWNER TO postgres;

REVOKE ALL ON SCHEMA sciencet FROM anon, authenticated, service_role;
REVOKE ALL ON ALL TABLES IN SCHEMA sciencet FROM anon, authenticated, service_role;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA sciencet FROM anon, authenticated, service_role;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA sciencet FROM anon, authenticated, service_role;

REVOKE ALL ON SCHEMA sciencet FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA sciencet FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA sciencet FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA sciencet FROM PUBLIC;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = 'sciencet_app'
  ) THEN
    CREATE ROLE sciencet_app
      LOGIN
      PASSWORD 'XXXsciencet_app';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE postgres TO sciencet_app;
GRANT USAGE ON SCHEMA sciencet TO sciencet_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA sciencet TO sciencet_app;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA sciencet TO sciencet_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA sciencet TO sciencet_app;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA sciencet
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA sciencet
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sciencet_app;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA sciencet
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO sciencet_app;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA sciencet
  GRANT EXECUTE ON FUNCTIONS TO sciencet_app;