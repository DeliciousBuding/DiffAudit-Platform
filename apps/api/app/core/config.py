from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="DIFFAUDIT_PLATFORM_", extra="ignore")

    app_name: str = "DiffAudit Platform API"
    app_env: str = "development"
    app_version: str = "0.1.0"
    cors_origin_regex: str = ".*"


settings = Settings()
