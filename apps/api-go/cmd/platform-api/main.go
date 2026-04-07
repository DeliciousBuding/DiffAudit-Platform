package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"

	"diffaudit/platform-api-go/internal/proxy"
)

type runtimeConfig struct {
	Host               string
	Port               string
	ResearchAPIBaseURL string
}

const (
	defaultHost               = "127.0.0.1"
	defaultPort               = "8780"
	defaultResearchAPIBaseURL = "http://127.0.0.1:8765"
)

func parseConfig(args []string) (runtimeConfig, error) {
	flagSet := flag.NewFlagSet("platform-api", flag.ContinueOnError)
	flagSet.SetOutput(os.Stdout)

	host := flagSet.String("host", defaultHost, "listen host")
	port := flagSet.String("port", defaultPort, "listen port")
	researchAPIBaseURL := flagSet.String(
		"research-api-base-url",
		defaultResearchAPIBaseURL,
		"upstream local research api base url",
	)
	if err := flagSet.Parse(args); err != nil {
		return runtimeConfig{}, err
	}
	return runtimeConfig{
		Host:               *host,
		Port:               *port,
		ResearchAPIBaseURL: *researchAPIBaseURL,
	}, nil
}

func main() {
	config, err := parseConfig(os.Args[1:])
	if err != nil {
		os.Exit(2)
	}
	server := proxy.NewServer(proxy.Config{
		ResearchAPIBaseURL: config.ResearchAPIBaseURL,
	})
	address := fmt.Sprintf("%s:%s", config.Host, config.Port)
	if err := http.ListenAndServe(address, server.Handler()); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
