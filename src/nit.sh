nit () {
    if [ -z "$1" ]; then
        echo "Available commands: "
        echo "      nit init"
        echo "      nit status"
        echo "      nit diff"
        echo "      nit add"
        echo "      nit commit"
        echo "      nit push"
        echo "      nit pull"
        echo "      nit clone"
        echo "      nit log"
    else
        node "../src/$1" "$2"
    fi
}