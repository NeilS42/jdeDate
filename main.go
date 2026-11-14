package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"
)

//go:embed static
var staticFiles embed.FS

func main() {
	staticFS, err := fs.Sub(staticFiles, "static")
	if err != nil {
		log.Fatal(err)
	}
	
	http.Handle("/", http.FileServer(http.FS(staticFS)))

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
