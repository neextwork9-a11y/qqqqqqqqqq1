"""Deployment regression tests: no live calls or credentials required."""
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("master_update", Path(__file__).with_name("master-update.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class DeploymentTests(unittest.TestCase):
    def test_financial_migration_is_shipped(self):
        self.assertIn("database/003_financial_safeguards.sql", module.FILES)

    def test_all_existing_migrations_are_shipped(self):
        migrations = {str(path.relative_to(module.ROOT)) for path in (module.ROOT / "database").glob("*.sql")}
        self.assertTrue(migrations)
        self.assertEqual(migrations, {path for path in module.FILES if path.startswith("database/")})


if __name__ == "__main__":
    unittest.main()