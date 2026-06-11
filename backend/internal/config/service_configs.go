package config

import (
	"backend/internal/service"
	"backend/pkg/env"
)

type ServiceConfigs struct {
	User     service.UserServiceConfig
	Post     service.PostServiceConfig
	Auth     service.AuthServiceConfig
	Invite   service.InviteServiceConfig
	Email    service.EmailServiceConfig
	Document service.DocumentServiceConfig
}

func NewServiceConfigs(sharedConfig SharedConfig, appConfig AppConfig) ServiceConfigs {
	return ServiceConfigs{
		User:     newUserServiceConfig(sharedConfig),
		Post:     newPostServiceConfig(sharedConfig),
		Auth:     newAuthServiceConfig(sharedConfig, appConfig),
		Invite:   newInviteServiceConfig(sharedConfig, appConfig),
		Email:    newEmailServiceConfig(appConfig),
		Document: newDocumentServiceConfig(sharedConfig),
	}
}

func newUserServiceConfig(sharedConfig SharedConfig) service.UserServiceConfig {
	return service.UserServiceConfig{
		BcryptCost:             sharedConfig.Security.BcryptCost,
		AvatarMaxSize:          sharedConfig.Storage.Avatar.MaxSize,
		AvatarUploadPath:       sharedConfig.Storage.Avatar.UploadPath,
		AvatarDeletePath:       sharedConfig.Storage.Avatar.DeletePath,
		AvatarAllowedMIMETypes: sharedConfig.Storage.Avatar.AllowedMIMETypes,
	}
}

func newPostServiceConfig(sharedConfig SharedConfig) service.PostServiceConfig {
	return service.PostServiceConfig{
		PhotoMaxSize:          sharedConfig.Storage.PostPhoto.MaxSize,
		PhotoUploadPath:       sharedConfig.Storage.PostPhoto.UploadPath,
		PhotoDeletePath:       sharedConfig.Storage.PostPhoto.DeletePath,
		PhotoAllowedMIMETypes: sharedConfig.Storage.PostPhoto.AllowedMIMETypes,
	}
}

func newAuthServiceConfig(sharedConfig SharedConfig, appConfig AppConfig) service.AuthServiceConfig {
	return service.AuthServiceConfig{
		JWTSecret:          sharedConfig.Security.AuthJWTSecret,
		AccessTokenExpiry:  sharedConfig.Security.AccessTokenExpiry,
		RefreshTokenExpiry: sharedConfig.Security.RefreshTokenExpiry,
		TokenIssuer:        sharedConfig.Security.AuthTokenIssuer,
		CookieSecure:       sharedConfig.Security.CookieSecure,
		FrontendURL:        appConfig.FrontendURL,
		BcryptCost:         sharedConfig.Security.BcryptCost,
	}
}

func newInviteServiceConfig(sharedConfig SharedConfig, appConfig AppConfig) service.InviteServiceConfig {
	return service.InviteServiceConfig{
		JWTSecret:   sharedConfig.Security.InviteJWTSecret,
		TokenExpiry: sharedConfig.Security.InviteTokenExpiry,
		TokenIssuer: sharedConfig.Security.InviteTokenIssuer,
		FrontendURL: appConfig.FrontendURL,
	}
}

func newEmailServiceConfig(appConfig AppConfig) service.EmailServiceConfig {
	return service.EmailServiceConfig{
		Host:        env.GetStringRequired("EMAIL_HOST"),
		Port:        env.GetIntRequired("EMAIL_PORT"),
		Username:    env.GetStringRequired("EMAIL_USERNAME"),
		Password:    env.GetStringRequired("EMAIL_PASSWORD"),
		From:        env.GetStringRequired("EMAIL_USERNAME"),
		FrontendURL: appConfig.FrontendURL,
		AppMode:     appConfig.AppMode,
	}
}

func newDocumentServiceConfig(sharedConfig SharedConfig) service.DocumentServiceConfig {
	return service.DocumentServiceConfig{
		FileMaxSize:    sharedConfig.Storage.Document.MaxSize,
		FileUploadPath: sharedConfig.Storage.Document.UploadPath,
	}
}
