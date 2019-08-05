#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <gflags/gflags.h>

DEFINE_string(search_word, "", "word to search");
DEFINE_string(character_file_name, "", "pattern file name");

static const int neighbor_x[] = {1, 1, 0, -1, -1, -1, 0, 1};
static const int neighbor_y[] = {0, 1, 1, 1, 0, -1, -1, -1};

int main(int argc, char* argv[]) {
  gflags::ParseCommandLineFlags(&argc, &argv, true);
  if (FLAGS_search_word.empty() || FLAGS_character_file_name.empty()) {
    std::cerr << "Please specify both --search_word and --character_file_name.\n";
    return -1;
  }
  std::ifstream character_file(FLAGS_character_file_name, std::ios_base::in);
  if (!character_file.is_open()) {
    std::cerr << "Failed to open file " << FLAGS_character_file_name << std::endl;
    return -1;
  }
  character_file.seekg(0, std::ios_base::end);
  int size = character_file.tellg();
  character_file.seekg(0, std::ios_base::beg);
  std::string contents;
  contents.resize(size);
  character_file.read(const_cast<char*>(contents.c_str()), size);
  std::vector<std::string> lines;
  int start_position = -1, i;
  for (i = 0; i < size; ++i) {
    if (contents[i] >= 'A' && contents[i] <= 'Z') {
      if (start_position == -1) {
        start_position = i;
      }
    } else {
      if (start_position != -1) {
        lines.emplace_back(contents.substr(start_position, i - start_position));
        start_position = -1;
      }
    }
  }
  if (start_position != -1) {
    lines.emplace_back(contents.substr(start_position, i - start_position));
  }

  int height = lines.size();
  int width = lines[0].size();
  for (int y = 0; y < height; ++y) {
    for (int x = 0; x < width; ++x) {
      if (lines[y].size() <= x) {
        continue;
      }
      if (lines[y][x] == FLAGS_search_word[0]) {
        for (int j = 0; j < 8; ++j) {
          int word_pos = 1;
          for (; word_pos < FLAGS_search_word.size(); ++word_pos) {
            int x_pos = neighbor_x[j] * word_pos + x;
            int y_pos = neighbor_y[j] * word_pos + y;
            if (x_pos < 0 || y_pos < 0 || x_pos >= width || y_pos >= height) {
              break;
            }
            if (x_pos >= lines[y_pos].size() || lines[y_pos][x_pos] != FLAGS_search_word[word_pos]) {
              break;
            }
          }
          if (word_pos == FLAGS_search_word.size()) {
            std::cout << "Found location " << x + 1 << "," << y + 1 << std::endl;
            return 0;
          }
        }
      }
    }
  }

  return 0;
}
