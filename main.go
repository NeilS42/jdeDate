package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	fs := http.FileServer(http.Dir("static"))
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
