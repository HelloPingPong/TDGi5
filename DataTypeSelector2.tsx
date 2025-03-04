import React, { useState } from 'react';
import Select from '../../common/Select';
import Card from '../../common/Card';
import Badge from '../../common/Badge';
import './DataTypeSelector.css';

interface DataTypeMetadata {
  type: string;
  displayName: string;
  category: string;
  description: string;
  constraintsMetadata: Record<string, string>;
}

interface DataTypeOption {
  value: string;
  label: string;
  category: string;
}

interface DataTypeSelectorProps {
  selectedType: string;
  onChange: (type: string) => void;
  dataTypes: Record<string, DataTypeMetadata> | null;
  isLoading: boolean;
  showDetails?: boolean;
}

export const DataTypeSelector: React.FC<DataTypeSelectorProps> = ({
  selectedType,
  onChange,
  dataTypes,
  isLoading,
  showDetails = false
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Prepare options from dataTypes object
  const getDataTypeOptions = (): { label: string; options: DataTypeOption[] }[] => {
    if (!dataTypes) return [];
    
    // Group data types by category
    const groupedOptions: Record<string, DataTypeOption[]> = {};
    
    Object.entries(dataTypes).forEach(([key, dataType]) => {
      const category = dataType.category || 'Other';
      
      if (!groupedOptions[category]) {
        groupedOptions[category] = [];
      }
      
      groupedOptions[category].push({
        value: key,
        label: dataType.displayName || key,
        category
      });
    });
    
    // Sort options within each group
    Object.values(groupedOptions).forEach(group => {
      group.sort((a, b) => a.label.localeCompare(b.label));
    });
    
    // Convert to format expected by Select component
    return Object.entries(groupedOptions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, options]) => ({
        label: category,
        options
      }));
  };
  
  const handleTypeChange = (value: string) => {
    onChange(value);
    if (showDetails) {
      setIsDetailsOpen(true);
    }
  };
  
  const selectedTypeMetadata = selectedType && dataTypes ? dataTypes[selectedType] : null;
  
  return (
    <div className="data-type-selector">
      <Select
        label="Data Type"
        value={selectedType}
        onChange={handleTypeChange}
        options={getDataTypeOptions()}
        isLoading={isLoading}
        placeholder="Select a data type..."
        required
      />
      
      {showDetails && isDetailsOpen && selectedTypeMetadata && (
        <Card className="data-type-details mt-4">
          <Card.Body>
            <div className="data-type-header">
              <h4 className="data-type-name">{selectedTypeMetadata.displayName}</h4>
              <Badge color="primary">{selectedTypeMetadata.category}</Badge>
            </div>
            
            <p className="data-type-description">{selectedTypeMetadata.description}</p>
            
            {Object.keys(selectedTypeMetadata.constraintsMetadata || {}).length > 0 && (
              <div className="data-type-constraints">
                <h5>Available Constraints:</h5>
                <ul>
                  {Object.entries(selectedTypeMetadata.constraintsMetadata).map(([key, description]) => (
                    <li key={key}>
                      <strong>{key}</strong>: {description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default DataTypeSelector;
