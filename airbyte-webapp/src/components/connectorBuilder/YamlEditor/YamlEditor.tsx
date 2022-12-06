import { useMonaco } from "@monaco-editor/react";
import { load, YAMLException } from "js-yaml";
import { editor } from "monaco-editor/esm/vs/editor/editor.api";
import { useEffect, useRef, useState } from "react";

import { CodeEditor } from "components/ui/CodeEditor";

import { ConnectorManifest } from "core/request/ConnectorBuilderClient";
import { useConnectorBuilderState } from "services/connectorBuilder/ConnectorBuilderStateService";

import { UiYamlToggleButton } from "../Builder/UiYamlToggleButton";
import { DownloadYamlButton } from "./DownloadYamlButton";
import styles from "./YamlEditor.module.scss";

interface YamlEditorProps {
  toggleYamlEditor: () => void;
}

export const YamlEditor: React.FC<YamlEditorProps> = ({ toggleYamlEditor }) => {
  const yamlEditorRef = useRef<editor.IStandaloneCodeEditor>();
  // const template = useManifestTemplate();
  // const [locallyStoredYaml, setLocallyStoredYaml] = useLocalStorage<string>("connectorBuilderYaml", template);
  // useDebounce(() => setLocallyStoredYaml(yamlValue), 500, [yamlValue]);
  const { yamlManifest, yamlIsValid, setYamlEditorIsMounted, setYamlIsValid, setJsonManifest } =
    useConnectorBuilderState();
  const [yamlValue, setYamlValue] = useState(yamlManifest);

  const monaco = useMonaco();

  useEffect(() => {
    if (monaco && yamlEditorRef.current && yamlValue) {
      const errOwner = "yaml";
      const yamlEditorModel = yamlEditorRef.current.getModel();

      try {
        const json = load(yamlValue) as ConnectorManifest;
        setJsonManifest(json);
        setYamlIsValid(true);

        // clear editor error markers
        if (yamlEditorModel) {
          monaco.editor.setModelMarkers(yamlEditorModel, errOwner, []);
        }
      } catch (err) {
        if (err instanceof YAMLException) {
          setYamlIsValid(false);
          const mark = err.mark;

          // set editor error markers
          if (yamlEditorModel) {
            monaco.editor.setModelMarkers(yamlEditorModel, errOwner, [
              {
                startLineNumber: mark.line + 1,
                startColumn: mark.column + 1,
                endLineNumber: mark.line + 1,
                endColumn: mark.column + 2,
                message: err.message,
                severity: monaco.MarkerSeverity.Error,
              },
            ]);
          }
        }
      }
    }
  }, [yamlValue, monaco, setJsonManifest, setYamlIsValid]);

  return (
    <div className={styles.container}>
      <div className={styles.control}>
        <UiYamlToggleButton yamlSelected onClick={toggleYamlEditor} />
        <DownloadYamlButton className={styles.downloadButton} yaml={yamlValue} yamlIsValid={yamlIsValid} />
      </div>
      <div className={styles.editorContainer}>
        <CodeEditor
          value={yamlValue}
          language="yaml"
          theme="airbyte-light"
          onChange={(value) => setYamlValue(value ?? "")}
          lineNumberCharacterWidth={6}
          onMount={(editor) => {
            setYamlEditorIsMounted(true);
            yamlEditorRef.current = editor;
          }}
        />
      </div>
    </div>
  );
};
