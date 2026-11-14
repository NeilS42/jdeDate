package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
)

func main() {
	staticDir := "static"
	
	if _, err := os.Stat(staticDir); os.IsNotExist(err) {
		exePath, err := os.Executable()
		if err == nil {
			staticDir = filepath.Join(filepath.Dir(exePath), "static")
		}
	}
	
	log.Printf("Serving static files from: %s", staticDir)
	
	fs := http.FileServer(http.Dir(staticDir))
	http.Handle("/", fs)

	port := os.Getenv("PORT")
	if port == "" {
		port = "5010"
	}
	addr := ":" + port
	log.Printf("JDE Date listening on http://localhost%s", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal(err)
	}
}
