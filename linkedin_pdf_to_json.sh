#! /bin/bash

if [[ "$1" =~ ^\-h ]] || [[ "$1" =~ ^\--help ]]; then
    echo
    echo "USAGE"
    echo "      <linkedin-pdf-to-json>/parse.sh [-aeit]"
    echo
    echo "DEFAULT"
    echo "      Parse each PDF in the ./test/spec/profiles/ and output the parsed JSON to the console without generating JSON files"
    echo
    echo "OPTIONS"
    echo "      -a      Generate a new JSON file for each PDF in the actual directory"
    echo "      -e      Generate a new JSON file for each PDF in the expected directory"
    echo "      -i      Prompts the user for confirmation to replace an already existing file with the same name in the expected directory (only works if -e option is present)"
    echo "      -t      Run the test suite after all of the PDFs have been parsed"
    echo
    exit
fi

# ignores spaces in filenames
SAVEIFS=$IFS
IFS=$(echo -en "\n\b")

# process PDFs
actual_dir="test/spec/actual/"
expected_dir="test/spec/expected/"
profiles_dir="test/spec/profiles/"
for file in $( ls "$profiles_dir" ); do
    original="$(basename $file)"
    if [[ "$1" =~ a ]]; then
        filename="${file%.*}"
        json=".json"
        file="$filename$json"
        parse "$profiles_dir$original" "$actual_dir$file"
        echo -n "."
    else
        parse "$profiles_dir$original"
    fi
done

echo

# argument handilng
if [[ "$1" =~ ^\- ]]; then
    if [[ "$1" =~ e ]]; then
        if [[ "$1" =~ i ]]; then
            for file in $( ls "$profiles_dir" ); do
                if [[ -e "$expected_dir$file" ]]; then
                    echo -n "A file already exists with the name $file. Replace it? (y/n) "
                    read answer
                    if [[ "$answer" =~ ^[yY] ]]; then
                        cp "$actual_dir$file" "$expected_dir$file"
                    fi
                else
                    cp "$actual_dir$file" "$expected_dir$file"
                fi
            done
        else
            cp "$actual_dir*" "$expected_dir"
        fi
    fi
    if [[ "$1" =~ t ]]; then
        node test/test.js
    fi
fi


