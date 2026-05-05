package config

import (
	"backend/pkg/env"
	"fmt"
)

type AppConfig struct {
	Port        int
	FrontendURL string
	AppMode     env.AppMode
}

func LoadAppConfig(appMode env.AppMode) AppConfig {
	protocol := "http"
	host := fmt.Sprintf("%s:%d", env.GetStringRequired("FRONTEND_HOST"), env.GetStringRequired("FRONTEND_PORT"))

	if appMode == env.AppModeProd {
		protocol = "https"
		host = env.GetStringRequired("FRONTEND_DOMAIN")
	}

	return AppConfig{
		Port:        37190,
		FrontendURL: fmt.Sprintf("%s://%s", protocol, host),
		AppMode:     appMode,
	}
}

func ParseAppMode(v string) env.AppMode {
	switch v {
	case string(env.AppModeDev):
		return env.AppModeDev
	case string(env.AppModeProd):
		return env.AppModeProd
	default:
		panic(fmt.Sprintf("unknown app mode: %s (expected dev or prod)", v))
	}
}
