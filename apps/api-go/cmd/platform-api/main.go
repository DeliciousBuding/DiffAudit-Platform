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

func parseConfig(args []string) (runtimeConfig, error) {
	flagSet := flag.NewFlagSet("platform-api", flag.ContinueOnError)
	flagSet.SetOutput(os.Stdout)

	host := flagSet.String("host", "127.0.0.1", "listen host")
	port := flagSet.String("port", "8780", "listen port")
	researchAPIBaseURL := flagSet.String(
		"research-api-base-url",
		"http://127.0.0.1:8765",
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
